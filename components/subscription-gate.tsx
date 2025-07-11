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

    const isExpired =
      subscription.status !== 'ACTIVE' ||
      (subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd) < new Date());

    if (isExpired && !isAllowedPath) {
      toast.warning('Your subscription has ended. Please upgrade to continue.');
      router.replace(`/workspace/${workspaceId}/subscription`);
    }
  }, [loading, subscription, pathname, router, workspaceId]);

  // block rendering until decision is made
  if (loading || !subscription) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  const isExpired =
    subscription.status !== 'ACTIVE' ||
    (subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) < new Date());

  const isAllowedPath = pathname.includes(`/workspace/${workspaceId}/subscription`);

  if (isExpired && !isAllowedPath) {
    // Block render for expired user on non-subscription page
    return null;
  }

  return <>{children}</>;
};
