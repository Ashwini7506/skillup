import { acceptInvitation } from '@/app/actions/accept-invitation';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { token } = await params;

  const invitation = await db.invitationToken.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date()
      }
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

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleAccept = async () => {
    'use server';
    const result = await acceptInvitation(token);
    if (result.success && result.redirectTo) {
      redirect(result.redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Project Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join a project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>{invitation.inviter.name}</strong> invited you to join:
            </p>
            <p className="font-medium">{invitation.project?.name}</p>
            <p className="text-sm text-gray-500">
              in workspace "{invitation.project?.Workspace.name}"
            </p>
          </div>
          
          <form action={handleAccept}>
            <Button type="submit" className="w-full">
              Accept Invitation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitePage;