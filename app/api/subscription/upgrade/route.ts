import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SKILLUP_TEAM_USER_ID = [
  "kp_bef756ed32e24ad99d5d9fa035832eb5",
  "kp_b571933f34f64bd5b2d1894bfa096e98"
];

// Utility function to add days to a date
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(23, 59, 59, 999);
  return result;
};

export async function POST(request: NextRequest) {
  try {
    const { userId, plan } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: 'User ID and plan required' }, { status: 400 });
    }

    // Prevent upgrades for SkillUp Team accounts
    if (SKILLUP_TEAM_USER_ID.includes(userId)) {
      return NextResponse.json({ error: 'Cannot modify SkillUp Team subscription' }, { status: 403 });
    }

    if (!['PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be PRO or ENTERPRISE' }, { status: 400 });
    }

    // Calculate period end and frequency based on plan
    let currentPeriodEnd: Date;
    let frequency: string;

    if (plan === 'PRO') {
      currentPeriodEnd = addDays(new Date(), 30);
      frequency = 'monthly';
    } else { // ENTERPRISE
      currentPeriodEnd = addDays(new Date(), 90);
      frequency = 'quarterly';
    }

    // Check if subscription exists
    const existingSubscription = await db.subscription.findUnique({
      where: { userId }
    });

    let subscription;

    if (existingSubscription) {
      // Update existing subscription
      subscription = await db.subscription.update({
        where: { userId },
        data: {
          plan,
          status: 'ACTIVE',
          currentPeriodEnd,
          frequency,
          cancelAtPeriodEnd: false
        }
      });
    } else {
      // Create new subscription
      subscription = await db.subscription.create({
        data: {
          userId,
          plan,
          status: 'ACTIVE',
          currentPeriodEnd,
          frequency,
          cancelAtPeriodEnd: false
        }
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}