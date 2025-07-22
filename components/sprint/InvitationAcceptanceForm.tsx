'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptSprintCohortInvitation } from '@/app/actions/accept-sprint-cohort-invitation-actions';

interface InvitationAcceptanceFormProps {
  token: string;
  cohortName: string;
  workspaceId: string;
  cohortId: string;
}

export default function InvitationAcceptanceForm({ 
  token, 
  cohortName, 
  workspaceId, 
  cohortId 
}: InvitationAcceptanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await acceptSprintCohortInvitation(token);
      
      if (result.success) {
        // Redirect to the cohort page or wherever specified
        router.push(result.redirectTo || `/workspace/${workspaceId}/sprint/`);
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Accept invitation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    // Redirect to dashboard or previous page
    router.push('/dashboard');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="flex space-x-4 justify-center">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Accepting...
            </>
          ) : (
            <>
              Accept Invitation
            </>
          )}
        </button>

        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Decline
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        By accepting, you'll be enrolled in the {cohortName} sprint cohort and gain access to the workspace.
      </p>
    </div>
  );
}