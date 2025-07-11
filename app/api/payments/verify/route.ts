// app/api/payments/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';


const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = body;

  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const generated_signature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const currentPeriodEnd = plan === 'PRO'
    ? addDays(new Date(), 30)
    : addDays(new Date(), 90);

  await db.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status: 'ACTIVE',
      currentPeriodEnd,
      frequency: plan === 'PRO' ? 'monthly' : 'quarterly',
      cancelAtPeriodEnd: false,
    },
    create: {
      userId,
      plan,
      status: 'ACTIVE',
      currentPeriodEnd,
      frequency: plan === 'PRO' ? 'monthly' : 'quarterly',
      cancelAtPeriodEnd: false,
    },
  });

  return NextResponse.json({ success: true });
}
