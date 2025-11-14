// components/BuyButton.tsx (React, Next.js client component)
'use client';

import React from 'react';

async function createOrderOnServer(amount: number) {
  const res = await fetch('/api/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
    document.body.appendChild(script);
  });
}

export default function BuyButton({ amount }: { amount: number }) {
  async function handleClick() {
    try {
      await loadRazorpayScript();
      const data = await createOrderOnServer(amount);
      if (!data?.order) return alert('Order creation failed');

      const order = data.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (window as any).RAZORPAY_KEY_ID, // expose key id as NEXT_PUBLIC var
        amount: order.amount, // in paise
        currency: order.currency,
        name: 'Your Company / EVOA',
        description: 'Subscription / One-time payment',
        order_id: order.id,
        handler: async function (response: any) {
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          // send to server to verify signature & confirm
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              // payment successful and verified server-side
              // update UI, redirect to dashboard, show toast
              alert('Payment successful! Plan activated.');
            } else {
              alert('Payment verification failed on server.');
            }
          } catch (e) {
            console.error('verification error', e);
            alert('Verification request failed.');
          }
        },
        prefill: {
          // optionally fill user email/phone
          email: '', phone: ''
        },
        notes: {
          // optional
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Payment initialization failed.');
    }
  }

  return (
    <button onClick={handleClick} className="btn-primary">
      Get started — ₹{amount}
    </button>
  );
}
