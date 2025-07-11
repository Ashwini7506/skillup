'use client';

import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { PricingCards } from '@/components/subscription/pricing-cards';
// import { SubscriptionActions } from '@/components/subscription/subscription-actions';
import { format } from 'date-fns';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { SubscriptionActions } from '@/components/subscription/subscription-actions';

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

export default function SubscriptionPage() {
  const { user } = useKindeBrowserClient();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/subscription?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800';
      case 'PRO':
        return 'bg-blue-100 text-blue-800';
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTrialExpired = (subscription: Subscription) => {
    if (!subscription.currentPeriodEnd) return false;
    return new Date(subscription.currentPeriodEnd) < new Date();
  };

  const getDaysRemaining = (subscription: Subscription) => {
    if (!subscription.currentPeriodEnd) return null;
    const now = new Date();
    const end = new Date(subscription.currentPeriodEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error Loading Subscription</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSubscription}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      {subscription && (
        <div className="space-y-6">
          {/* Current Subscription Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <div>
                    <CardTitle className="text-xl">Current Plan</CardTitle>
                    <CardDescription>Your active subscription details</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPlanColor(subscription.plan)}>
                    {subscription.plan}
                  </Badge>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Billing Frequency:</span>
                    <span className="capitalize">{subscription.frequency}</span>
                  </div>
                  
                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {subscription.plan === 'FREE' ? 'Trial Ends:' : 'Next Billing:'}
                      </span>
                      <span>
                        {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {subscription.plan === 'FREE' && subscription.currentPeriodEnd && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {isTrialExpired(subscription) ? (
                          <span className="font-medium text-red-600">Trial has expired</span>
                        ) : (
                          <>
                            <span className="font-medium">
                              {getDaysRemaining(subscription)} days left
                            </span>
                            {' '}in your free trial
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {subscription.cancelAtPeriodEnd && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Cancellation scheduled:</span> Your subscription will end on{' '}
                        {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <SubscriptionActions
                    subscription={subscription} 
                    onUpdateAction={fetchSubscription}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
            <PricingCards 
              currentPlan={subscription.plan} 
              onUpgradeAction={fetchSubscription}
            />
          </div>
        </div>
      )}
    </div>
  );
}