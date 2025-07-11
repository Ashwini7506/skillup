'use client';

import { useState } from 'react';
// import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, X, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface Subscription {
  id: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodEnd: string | null;
  frequency: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionActionsProps {
  subscription: Subscription;
  onUpdateAction: () => void;
}

export function SubscriptionActions({ subscription, onUpdateAction }: SubscriptionActionsProps) {
  const { user } = useKindeBrowserClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // const handleSubscriptionAction = async (action: 'cancel' | 'reactivate') => {
  //   if (!user?.id) return;

  //   setLoading(true);
  //   try {
  //     const response = await fetch('/api/subscription', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         userId: user.id,
  //         action
  //       })
  //     });

  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.error || `Failed to ${action} subscription`);
  //     }

  //     toast.success(
  //       action === 'cancel' 
  //         ? 'Subscription will be cancelled at the end of the current period'
  //         : 'Subscription reactivated successfully'
  //     );
  //     onUpdateAction();
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : `Failed to ${action} subscription`);
  //   } finally {
  //     setLoading(false);
  //     setShowCancelDialog(false);
  //     setShowReactivateDialog(false);
  //   }
  // };

const handleSubscriptionAction = async (action: 'cancel' | 'reactivate') => {
  if (!user?.id) return;

  setLoading(true);

  try {
    if (action === 'cancel') {
      // 🔴 Cancel doesn't need payment
      const response = await fetch('/api/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'cancel'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription will be cancelled at the end of current period');
      onUpdateAction();
    }

    if (action === 'reactivate') {
      const plan = subscription.plan;
      const amount = plan === 'PRO' ? 50 : plan === 'ENTERPRISE' ? 120 : null;
      if (!amount) return toast.error('Invalid plan selected for reactivation');

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan, amount }),
      });

      const data = await res.json();
      if (!data.orderId) throw new Error('Failed to create Razorpay order');

      const razorpay = new (window as any).Razorpay({
        key: process.env.RAZORPAY_KEY_ID,
        name: 'SkillUp',
        description: `${plan} Plan Subscription`,
        order_id: data.orderId,
        currency: 'INR',
        amount: amount * 100,
        handler: async (response: any) => {
          const verify = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              userId: user.id,
              plan,
            }),
          });

          const result = await verify.json();
          if (result.success) {
            toast.success('Payment successful. Subscription reactivated!');
            onUpdateAction();
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.given_name || user.family_name || 'SkillUp User',
          email: user.email,
        },
        theme: {
          color: '#2563eb',
        },
      });

      razorpay.open();
    }
  } catch (err: any) {
    console.error('[SUBSCRIPTION_ACTION_ERROR]', err);
    toast.error(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
    setShowCancelDialog(false);
    setShowReactivateDialog(false);
  }
};


  // Don't show actions for free plan or expired subscriptions
  if (subscription.plan === 'FREE' || subscription.status === 'EXPIRED') {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {subscription.cancelAtPeriodEnd ? (
            <DropdownMenuItem onClick={() => setShowReactivateDialog(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowCancelDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Subscription
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access 
              to all features until the end of your current billing period
              {subscription.currentPeriodEnd && (
                <span className="font-medium">
                  {' '}({new Date(subscription.currentPeriodEnd).toLocaleDateString()})
                </span>
              )}
              . After that, your account will be downgraded to the free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubscriptionAction('cancel')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate your subscription? This will continue 
              your current billing cycle and you'll continue to be charged 
              {subscription.frequency === 'monthly' ? 'monthly' : 'quarterly'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubscriptionAction('reactivate')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Reactivating...' : 'Reactivate Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}