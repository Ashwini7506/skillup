// app/(protected)/sprint/invitation/[token]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/lib/get-current-user';
import { db } from '@/lib/db';
import InvitationAcceptanceForm from '@/components/sprint/InvitationAcceptanceForm';

interface InvitationPageProps {
  params: Promise<{
    token: string;
    workspaceId: string;
  }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const resolvedParams = await params;
  const user = await getCurrentUserServer();
  const { token, workspaceId } = resolvedParams; // Fix this line

  
  if (!user) {
    redirect('/auth/login');
  }

  // Get invitation details
  const invitation = await db.sprintInvitationToken.findFirst({
    where: {
      token: resolvedParams.token,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      cohort: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          activated: true
        }
      },
      invitedBy: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!invitation) {
    notFound();
  }

  // Fetch workspace separately since relation is not defined in schema
  const workspace = await db.workspace.findUnique({
    where: {
      id: invitation.workspaceId
    },
    select: {
      id: true,
      name: true,
      description: true
    }
  });

  if (!workspace) {
    notFound();
  }

  // Check if invitation email matches current user
  if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This invitation is for {invitation.email}, but you are signed in as {user.email}.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Please sign in with the correct email address or contact the person who invited you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is already enrolled
  const existingEnrollment = await db.sprintEnrollment.findFirst({
    where: {
      userId: user.id,
      cohortId: invitation.cohortId
    }
  });

  if (existingEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Already Enrolled
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You are already enrolled in the {invitation.cohort.name} sprint cohort.
            </p>
            <div className="mt-6">
              <a
                href={`/workspace/${workspaceId}/sprint/`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Sprint Cohort
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use the name field from User model instead of given_name/family_name
  const inviterName = invitation.invitedBy?.name || invitation.invitedBy?.email || 'Someone';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sprint Cohort Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited to join a sprint cohort
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Invitation Details
              </h3>
              
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Invited by</dt>
                  <dd className="mt-1 text-sm text-gray-900">{inviterName}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Workspace</dt>
                  <dd className="mt-1 text-sm text-gray-900">{workspace.name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sprint Cohort</dt>
                  <dd className="mt-1 text-sm text-gray-900">{invitation.cohort.name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{invitation.intendedRole}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invitation.cohort.startDate ? new Date(invitation.cohort.startDate).toLocaleDateString() : 'TBD'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invitation.cohort.endDate ? new Date(invitation.cohort.endDate).toLocaleDateString() : 'TBD'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Note: SprintCohort doesn't have description field in schema, 
                so removing this section or you need to add description to SprintCohort model */}

            <div className="border-t pt-6">
              <InvitationAcceptanceForm 
                token={resolvedParams.token}
                cohortName={invitation.cohort.name}
                workspaceId={invitation.workspaceId}
                cohortId={invitation.cohortId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}