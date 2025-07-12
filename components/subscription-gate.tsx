'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { toast } from 'sonner';

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export const SubscriptionGate = ({ children }: SubscriptionGateProps) => {
  const { subscription, loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();

  useEffect(() => {
    if (loading || !workspaceId) return;

    const isAllowedPath = pathname.includes(`/workspace/${workspaceId}/subscription`);

    // wait until subscription data is loaded
    if (!subscription) return;

    // Check if subscription is expired
    const isExpired = checkSubscriptionExpired(subscription);

    if (isExpired && !isAllowedPath) {
      const message = subscription.plan === 'FREE' 
        ? 'Your free trial has ended. Please upgrade to continue.'
        : 'Your subscription has ended. Please upgrade to continue.';
      
      toast.warning(message);
      router.replace(`/workspace/${workspaceId}/subscription`);
    }
  }, [loading, subscription, pathname, router, workspaceId]);

  // Helper function to check if subscription is expired
  const checkSubscriptionExpired = (subscription: any) => {
    // If status is not ACTIVE, it's expired
    if (subscription.status !== 'ACTIVE') {
      return true;
    }

    // If currentPeriodEnd is null or undefined (like for SkillUp team), never expires
    if (!subscription.currentPeriodEnd) {
      return false;
    }

    // TypeScript-safe date comparison
    const currentDate = new Date();
    const periodEndDate = new Date(subscription.currentPeriodEnd);
    
    // Check if the date is valid
    if (isNaN(periodEndDate.getTime())) {
      console.error('Invalid currentPeriodEnd date:', subscription.currentPeriodEnd);
      return true; // Treat invalid dates as expired for safety
    }
    
    return currentDate > periodEndDate;
  };

  // block rendering until decision is made
  if (loading || !subscription) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  const isExpired = checkSubscriptionExpired(subscription);
  const isAllowedPath = pathname.includes(`/workspace/${workspaceId}/subscription`);

  if (isExpired && !isAllowedPath) {
    // Block render for expired user on non-subscription page
    return null;
  }

  return <>{children}</>;
};
