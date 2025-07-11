'use client';

import { useState } from 'react';
import { inviteUserToProject } from '@/app/actions/invitation-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, CheckCircle, XCircle, Circle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface InviteMemberFormProps {
  projectId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Sending...
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          Send Invitation
        </>
      )}
    </Button>
  );
}

export const InviteMemberForm = ({ projectId }: InviteMemberFormProps) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    const result = await inviteUserToProject(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Invitation sent successfully' });
      // Reset form
      const form = document.getElementById('invite-form') as HTMLFormElement;
      form?.reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to send invitation' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Invite Member
        </CardTitle>
        <CardDescription>
          Send an email invitation to collaborate on this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="invite-form" action={handleSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
            />
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
};
