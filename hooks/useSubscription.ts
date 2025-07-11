'use client';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs';

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

export function useSubscription() {
  const { user } = useKindeBrowserClient();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
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

  const isTrialExpired = () => {
    if (!subscription || !subscription.currentPeriodEnd) return false;
    return new Date(subscription.currentPeriodEnd) < new Date();
  };

  const getDaysRemaining = () => {
    if (!subscription || !subscription.currentPeriodEnd) return null;
    const now = new Date();
    const end = new Date(subscription.currentPeriodEnd);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const hasActiveSubscription = () => {
    if (!subscription) return false;
    return subscription.status === 'ACTIVE' && !isTrialExpired();
  };

  const canAccessFeature = (requiredPlan: 'FREE' | 'PRO' | 'ENTERPRISE') => {
    if (!subscription) return false;
    
    const planHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 };
    const userPlanLevel = planHierarchy[subscription.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];
    
    return userPlanLevel >= requiredPlanLevel && hasActiveSubscription();
  };

  const upgrade = async (plan: 'PRO' | 'ENTERPRISE') => {
    if (!user?.id) throw new Error('User not authenticated');

    const response = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        plan
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upgrade subscription');
    }

    const updatedSubscription = await response.json();
    setSubscription(updatedSubscription);
    return updatedSubscription;
  };

  const cancelSubscription = async () => {
    if (!user?.id) throw new Error('User not authenticated');

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

    const updatedSubscription = await response.json();
    setSubscription(updatedSubscription);
    return updatedSubscription;
  };

  const reactivateSubscription = async () => {
    if (!user?.id) throw new Error('User not authenticated');

    const response = await fetch('/api/subscription', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        action: 'reactivate'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reactivate subscription');
    }

    const updatedSubscription = await response.json();
    setSubscription(updatedSubscription);
    return updatedSubscription;
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    isTrialExpired,
    getDaysRemaining,
    hasActiveSubscription,
    canAccessFeature,
    upgrade,
    cancelSubscription,
    reactivateSubscription
  };
}