import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { nanoid } from "nanoid";
import Stripe from "stripe";

/**
 * POST /api/courses/webhook
 * Handles Stripe webhook events for course enrollment.
 *
 * Listens for: checkout.session.completed
 * Creates enrollment record and grants access.
 */
export async function POST(request: NextRequest) {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeWebhookSecret || !stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe nao configurado" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Assinatura em falta" },
      { status: 400 }
    );
  }

  // Verify webhook signature using Stripe SDK
  const stripe = new Stripe(stripeSecretKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Assinatura invalida";
    return NextResponse.json(
      { error: `Webhook: ${msg}` },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object;
  if (!session?.metadata) {
    return NextResponse.json({ received: true });
  }

  const { user_id, course_slug, course_id } = session.metadata;
  if (!user_id || !course_slug || !course_id) {
    return NextResponse.json({ received: true });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Database nao configurada" },
      { status: 500 }
    );
  }

  // Create enrollment
  const certificateCode = `SV-${nanoid(8).toUpperCase()}`;

  const { error } = await admin.from("enrollments").upsert(
    {
      user_id,
      course_id,
      stripe_payment_id: session.payment_intent || session.id,
      enrolled_at: new Date().toISOString(),
      certificate_code: certificateCode,
    },
    { onConflict: "user_id,course_id" }
  );

  if (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Erro ao criar inscricao" },
      { status: 500 }
    );
  }

  // Notify admin
  await admin.from("admin_notifications").insert({
    type: "general",
    title: "Nova inscricao em curso",
    message: `Utilizador inscreveu-se no curso ${course_slug}`,
    details: { user_id, course_slug, payment_id: session.payment_intent },
  });

  return NextResponse.json({ received: true, enrolled: true });
}
