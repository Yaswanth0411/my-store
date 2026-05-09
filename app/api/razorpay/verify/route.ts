import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shipping,
      total,
      email,
    } = await req.json();

    // ── Verify payment signature ──────────────────
    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ── Save order to Supabase ────────────────────
    const orderId = `ORD-${Date.now()}`;

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id:         orderId,
        total,
        status:     "confirmed",
        shipping,
      });

    if (orderError) throw orderError;

    // ── Save order items ──────────────────────────
    const orderItems = items.map((item: {
      product: { id: number; name: string; price: number };
      quantity: number;
    }) => ({
      order_id:     orderId,
      product_id:   item.product.id,
      product_name: item.product.name,
      price:        item.product.price,
      quantity:     item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // ── Send confirmation email ───────────────────
    if (email) {
      await resend.emails.send({
        from:    "MyStore <onboarding@resend.dev>",
        to:      email,
        subject: `Order confirmed — ${orderId}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px">
            <h1 style="font-size:24px;font-weight:600;margin-bottom:8px">
              Order confirmed! ✓
            </h1>
            <p style="color:#78716c;margin-bottom:24px">
              Thank you for your purchase. Your order
              <strong>${orderId}</strong> has been confirmed
              and will be delivered in 3–5 business days.
            </p>
            <div style="background:#f5f5f4;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="margin:0;font-size:14px;color:#78716c">Order total</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:600;color:#059669">
                ₹${total.toFixed(2)}
              </p>
            </div>
            <p style="color:#78716c;font-size:14px;margin-bottom:24px">
              Payment ID: ${razorpay_payment_id}
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}"
               style="display:inline-block;background:#1c1917;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:500">
              Continue shopping →
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
