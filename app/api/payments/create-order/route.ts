// app/api/payments/create-order/route.ts

import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount } = await req.json(); // amount in INR

  if (!amount) {
    return NextResponse.json({ error: "Amount required" }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: "receipt_order_" + Math.floor(Math.random() * 1000000),
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (err) {
    console.error("Razorpay error", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
