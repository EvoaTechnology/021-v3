// app/api/razorpay/order/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const key_id = process.env.RAZORPAY_KEY_ID!;
const key_secret = process.env.RAZORPAY_KEY_SECRET!;

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // price_in_rupees expected from caller (e.g. 499) OR calculate by planId
    const { amount, currency = 'INR', receiptId, notes } = body;

    if (!amount) {
      return NextResponse.json({ error: 'amount required' }, { status: 400 });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // paise
      currency,
      receipt: receiptId ?? `rcpt_${Date.now()}`,
      payment_capture: 1, // 1 = auto-capture; 0 = manual capture
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    // Save order.id and associated user/plan in your DB here (important!)
    // e.g. await db.orders.create({ razorpayOrderId: order.id, userId, planId, amount, status: 'created' });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('Razorpay order creation failed', err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
