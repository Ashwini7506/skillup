import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendInvitationEmail, sendOTPEmail } from './email-service';

export const createProjectInvitation = async (
  email: string,
  projectId: string,
  invitedBy: string
) => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const invitation = await db.invitationToken.create({
    data: {
      email,
      token,
      expiresAt,
      type: 'PROJECT_INVITATION',
      projectId,
      invitedBy
    },
    include: {
      project: {
        include: {
          Workspace: true
        }
      },
      inviter: {
        select: {
          name: true
        }
      }
    }
  });

  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  
  await sendInvitationEmail(
    email,
    invitation.inviter.name,
    invitation.project?.name || 'Project',
    invitationLink
  );

  return { success: true, invitation };
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTPVerification = async (email: string) => {
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes from now

  await db.invitationToken.create({
    data: {
      email,
      token: otp,
      expiresAt,
      type: 'USER_VERIFICATION',
      invitedBy: 'system' // This should be a valid user ID or handle differently
    }
  });

  await sendOTPEmail(email, otp);
  return { success: true };
};

export const verifyOTP = async (email: string, otp: string) => {
  const token = await db.invitationToken.findFirst({
    where: {
      email,
      token: otp,
      type: 'USER_VERIFICATION',
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!token) {
    return { success: false, error: 'Invalid or expired OTP' };
  }

  await db.invitationToken.update({
    where: { id: token.id },
    data: { used: true }
  });

  return { success: true };
};