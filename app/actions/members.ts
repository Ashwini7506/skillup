"use server";

import { db } from "@/lib/db";
import { userRequired } from "@/app/data/user/is-user-authenticated";
import { revalidatePath } from "next/cache";

// Get current authenticated user
async function me() {
  const { user } = await userRequired();
  return user!;
}

// 🔍 Member search based on filters (excluding self + accepted)
export async function searchMembers(
  workspaceId: string,
  job: string,
  role: string
) {
  const currentUser = await me();

  // Exclude self & accepted collaborators
  const acceptedUsers = await db.joinRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: currentUser.id, project: null },
        { requesterId: currentUser.id, project: { workspaceId } },
        { userId: currentUser.id, project: null },
        { userId: currentUser.id, project: { workspaceId } },
      ],
    },
  });

  const acceptedUserIds = new Set<string>();
  acceptedUsers.forEach((r) => {
    const otherId = r.requesterId === currentUser.id ? r.userId : r.requesterId;
    acceptedUserIds.add(otherId);
  });

  const where: any = {
    id: { notIn: [currentUser.id, ...Array.from(acceptedUserIds)] },
  };

  if (job) {
    where.job = { contains: job, mode: "insensitive" };
  }

  if (role) {
    where.role = { contains: role, mode: "insensitive" };
  }

  return db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      job: true,
      role: true,
      image: true,
    },
    orderBy: { name: "asc" },
  });
}

// 💡 Suggestions with no filter
export async function suggestions(workspaceId: string) {
  const currentUser = await me();

  const acceptedUsers = await db.joinRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: currentUser.id, project: null },
        { requesterId: currentUser.id, project: { workspaceId } },
        { userId: currentUser.id, project: null },
        { userId: currentUser.id, project: { workspaceId } },
      ],
    },
  });

  const acceptedUserIds = new Set<string>();
  acceptedUsers.forEach((r) => {
    const otherId = r.requesterId === currentUser.id ? r.userId : r.requesterId;
    acceptedUserIds.add(otherId);
  });

  return db.user.findMany({
    where: {
      id: {
        notIn: [currentUser.id, ...Array.from(acceptedUserIds)],
      },
      workspace: {
        some: { workspaceId },
      },
    },
    select: {
      id: true,
      name: true,
      job: true,
      role: true,
      image: true,
    },
    take: 20,
    orderBy: { name: "asc" },
  });
}

// 📩 Send a join request
export async function sendJoinRequest(
  targetUserId: string,
  workspaceId: string,
  projectId: string | null = null
) {
  const user = await me();

  const existingRequest = await db.joinRequest.findFirst({
    where: {
      requesterId: user.id,
      userId: targetUserId,
      projectId: projectId ?? undefined,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    throw new Error("Request already sent");
  }

  await db.joinRequest.create({
    data: {
      requesterId: user.id,
      userId: targetUserId,
      projectId: projectId ?? undefined,
    },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
}

// ✅ Accept join request
export async function acceptRequest(requestId: string, workspaceId: string) {
  const user = await me();

  const request = await db.joinRequest.findFirst({
    where: {
      id: requestId,
      userId: user.id,
      status: "PENDING",
    },
  });

  if (!request) throw new Error("Not authorized or request invalid");

  await db.joinRequest.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
}

// ❌ Reject join request
export async function rejectRequest(requestId: string, workspaceId: string) {
  const user = await me();

  const request = await db.joinRequest.findFirst({
    where: {
      id: requestId,
      userId: user.id,
      status: "PENDING",
    },
  });

  if (!request) throw new Error("Not authorized or request invalid");

  await db.joinRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
}

// 🤝 Get collaborators (accepted requests from either side)
export async function listAcceptedMembers(workspaceId: string) {
  const user = await me();

  const accepted = await db.joinRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: user.id, project: null },
        { requesterId: user.id, project: { workspaceId } },
        { userId: user.id, project: null },
        { userId: user.id, project: { workspaceId } },
      ],
    },
    include: { user: true, requester: true },
    orderBy: { createdAt: "desc" },
  });

  const collaborators = accepted.map((r) =>
    r.requesterId === user.id ? r.user : r.requester
  );

  const seen = new Set<string>();
  return collaborators.filter((u) => !seen.has(u.id) && seen.add(u.id));
}

// 💬 Send a message (must be accepted collaborators either way)
export async function sendMessageToUser(
  workspaceId: string,
  receiverId: string,
  content: string
) {
  const user = await me();

  const isAccepted = await db.joinRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: user.id, userId: receiverId },
        { requesterId: receiverId, userId: user.id },
      ],
    },
  });

  if (!isAccepted) throw new Error("You are not connected to this user");

  await db.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content: content.trim(),
    },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
}

// 💌 List chat between current user and selected user
export async function listMessagesWithUser(otherUserId: string) {
  const user = await me();

  return db.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

// 📬 List requests (incoming & outgoing)
export async function listJoinRequests(workspaceId: string) {
  const user = await me();

  const incoming = await db.joinRequest.findMany({
    where: {
      userId: user.id,
      status: "PENDING",
      OR: [{ project: null }, { project: { workspaceId } }],
    },
    include: {
      requester: true,
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const outgoing = await db.joinRequest.findMany({
    where: {
      requesterId: user.id,
      status: "PENDING",
      OR: [{ project: null }, { project: { workspaceId } }],
    },
    include: {
      user: true,
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { incoming, outgoing };
}
