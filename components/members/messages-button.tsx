"use client";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { useChatStore } from "./chat-store";
import Image from "next/image";

export default function MessagesButton({ workspaceId }: { workspaceId: string }) {
  const { openChat } = useChatStore();
  type Collaborator = { id: string; name: string; image?: string };
  const { data: collaborators = [] } = useSWR<Collaborator[]>(
    `/api/members/accepted?workspaceId=${workspaceId}`,
    fetcher
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => document.getElementById("chat-collab-modal")?.classList.remove("hidden")}
        className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50"
      >
        💬 Messages
      </button>

      {/* Collaborator Selector Modal */}
      <div id="chat-collab-modal" className="hidden fixed bottom-20 right-6 bg-white shadow-lg rounded-lg p-4 z-50 w-64">
        <h3 className="text-sm font-semibold mb-2">Select Collaborator</h3>
        <ul className="max-h-60 overflow-y-auto space-y-2">
          {collaborators.map((u: any) => (
            <li key={u.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {u.image && <Image src={u.image} alt="avatar" width={28} height={28} className="rounded-full" />}
                <span className="text-sm">{u.name}</span>
              </div>
              <button
                onClick={() => {
                  openChat(u);
                  document.getElementById("chat-collab-modal")?.classList.add("hidden");
                }}
                className="text-blue-500 text-xs hover:underline"
              >
                Chat
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
