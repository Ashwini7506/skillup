'use client';

import { useState } from 'react';
// import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface PricingPlan {
  id: 'FREE' | 'PRO' | 'ENTERPRISE';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: any;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '₹0',
    period: '3-day trial',
    description: 'Perfect for trying out our platform',
    icon: Clock,
    features: [
      'Access to basic features',
      '3-day trial period',
      'Community support',
      'Basic templates',
      'Limited projects'
    ]
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '₹50',
    period: 'month',
    description: 'Best for individual professionals',
    icon: Star,
    popular: true,
    features: [
      'All Free features',
      'Unlimited projects',
      'Advanced templates',
      'Priority support',
      'Export capabilities',
      'Analytics dashboard'
    ]
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '₹120',
    period: 'quarter',
    description: 'Ideal for teams and organizations',
    icon: Zap,
    features: [
      'All Pro features',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'Custom branding',
      'API access'
    ]
  }
];

interface PricingCardsProps {
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  onUpgradeAction: () => void;
}

export function PricingCards({ currentPlan, onUpgradeAction }: PricingCardsProps) {
  const { user } = useKindeBrowserClient();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'PRO' | 'ENTERPRISE') => {
    if (!user?.id) return;
    const confirmUpgrade = window.confirm(`Proceed with payment and upgrade to ${planId} plan?`);
  if (!confirmUpgrade) return;

    setUpgrading(planId);
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          plan: planId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upgrade subscription');
      }

      toast.success(`Successfully upgraded to ${planId} plan!`);
      onUpgradeAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upgrade subscription');
    } finally {
      setUpgrading(null);
    }
  };

  const isCurrentPlan = (planId: string) => planId === currentPlan;
  const canUpgrade = (planId: string) => {
    if (planId === 'FREE') return false;
    if (currentPlan === 'FREE') return true;
    if (currentPlan === 'PRO' && planId === 'ENTERPRISE') return true;
    return false;
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {pricingPlans.map((plan) => {
        const Icon = plan.icon;
        const isCurrent = isCurrentPlan(plan.id);
        const canUpgradeToThis = canUpgrade(plan.id);

        return (
          <Card
            key={plan.id}
            className={`relative transition-all duration-300 hover:shadow-lg ${
              plan.popular
                ? 'border-2 border-blue-500 shadow-lg scale-105'
                : 'border border-gray-200'
            } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            {isCurrent && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    plan.popular ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  isCurrent
                    ? 'bg-green-500 hover:bg-green-600'
                    : plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                disabled={!canUpgradeToThis || upgrading !== null}
                onClick={() => {
                  if (canUpgradeToThis && plan.id !== 'FREE') {
                    handleUpgrade(plan.id);
                  }
                }}
              >
                {upgrading === plan.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Upgrading...
                  </div>
                ) : isCurrent ? (
                  'Current Plan'
                ) : canUpgradeToThis ? (
                  plan.id === 'FREE' ? 'Start Free Trial' : 'Upgrade'
                ) : (
                  'Not Available'
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}