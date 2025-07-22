import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Configuration for skillup team
const SKILLUP_TEAM_USER_ID = ["kp_bef756ed32e24ad99d5d9fa035832eb5", "kp_b571933f34f64bd5b2d1894bfa096e98", "kp_7df84857bdeb4d48b6120a06d093c45f" ];

// Utility function to add days to a date
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
   result.setHours(23, 59, 59, 999)
  return result;
};

// Special handling for SkillUp Team
const createSkillUpTeamSubscription = () => ({
  id: 'skillup-team-subscription',
  userId: SKILLUP_TEAM_USER_ID,
  plan: 'ENTERPRISE',
  status: 'ACTIVE',
  currentPeriodEnd: null, // No expiry
  frequency: 'quarterly',
  cancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lemonsqueezyId: null,
  orderId: null,
  customerId: null
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('[SUBSCRIPTION][GET] Request for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (SKILLUP_TEAM_USER_ID.includes(userId)) {
      // console.log('[SUBSCRIPTION][GET] Returning SkillUp Team subscription bypass');
      return NextResponse.json(createSkillUpTeamSubscription());
    }

    let subscription = await db.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      const trialEndDate = addDays(new Date(), 3);
      // console.log('[SUBSCRIPTION][GET] No subscription found. Creating FREE trial for user:', userId);

      subscription = await db.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodEnd: trialEndDate,
          frequency: 'monthly',
          cancelAtPeriodEnd: false
        }
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('[SUBSCRIPTION][GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, action } = await request.json();

    // console.log('[SUBSCRIPTION][PUT] Action:', action, 'for userId:', userId);

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }

    if (SKILLUP_TEAM_USER_ID.includes(userId)) {
      console.warn('[SUBSCRIPTION][PUT] BLOCKED: SkillUp Team cannot cancel/reactivate');
      return NextResponse.json({ error: 'Cannot modify SkillUp Team subscription' }, { status: 403 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      console.warn('[SUBSCRIPTION][PUT] No subscription found for user:', userId);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case 'cancel':
        updateData.cancelAtPeriodEnd = true;
        break;
      case 'reactivate':
        updateData.cancelAtPeriodEnd = false;
        break;
      default:
        console.error('[SUBSCRIPTION][PUT] Invalid action:', action);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedSubscription = await db.subscription.update({
      where: { userId },
      data: updateData
    });

    console.log('[SUBSCRIPTION][PUT] Subscription updated for user:', userId, '->', action);

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('[SUBSCRIPTION][PUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
