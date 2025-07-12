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

    // 🔍 DEBUG: Log subscription data
    console.log('=== SUBSCRIPTION DEBUG ===');
    console.log('Subscription data:', subscription);
    console.log('Current date:', new Date());
    console.log('Period end (raw):', subscription.currentPeriodEnd);
    console.log('Period end (parsed):', new Date(subscription.currentPeriodEnd));
    console.log('Status:', subscription.status);
    console.log('Plan:', subscription.plan);
    
    const currentDate = new Date();
    const periodEndDate = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;
    
    console.log('Current date ISO:', currentDate.toISOString());
    console.log('Period end ISO:', periodEndDate?.toISOString());
    console.log('Is current > period end?', periodEndDate ? currentDate > periodEndDate : 'N/A');
    console.log('=== END DEBUG ===');

    // Check if subscription is expired
    const isExpired = checkSubscriptionExpired(subscription);
    console.log('Final isExpired result:', isExpired);

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
      console.log('Subscription not ACTIVE, status:', subscription.status);
      return true;
    }

    // If currentPeriodEnd is null (like for SkillUp team), never expires
    if (!subscription.currentPeriodEnd) {
      console.log('No period end date, never expires');
      return false;
    }

    // Check if current date is after the period end
    const currentDate = new Date();
    const periodEndDate = new Date(subscription.currentPeriodEnd);
    
    const expired = currentDate > periodEndDate;
    console.log('Date comparison result:', expired);
    
    return expired;
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
