// app/api/razorpay/verify/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Signature valid: update DB: mark order as paid, attach payment id, maybe create subscription
      // e.g. await db.orders.update({ where: { razorpayOrderId: razorpay_order_id }, data: { status:'paid', paymentId: razorpay_payment_id } });

      return NextResponse.json({ success: true });
    } else {
      console.warn('Signature mismatch', { generated_signature, razorpay_signature });
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err.message) }, { status: 500 });
  }
}
