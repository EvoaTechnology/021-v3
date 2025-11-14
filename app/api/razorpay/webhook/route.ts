import { NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.log("Webhook signature mismatch");
    return NextResponse.json({ status: "invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  if (event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;

    console.log("Payment captured:", paymentId);

    // TODO: update order in DB:
    // mark user plan as active
  }

  if (event === "payment.failed") {
    console.log("Payment failed");
  }

  return NextResponse.json({ status: "success" }, { status: 200 });
}

export const config = {
  api: {
    bodyParser: false, // important for raw body
  },
};
