import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Stripe from "stripe";

/**
 * POST /api/courses/checkout
 * Creates a Stripe Checkout Session for course enrollment.
 *
 * Body: { courseSlug: string }
 * Returns: { url: string } (Stripe checkout URL)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Nao autenticado" },
        { status: 401 }
      );
    }

    const { courseSlug } = await request.json();
    if (!courseSlug) {
      return NextResponse.json(
        { error: "courseSlug obrigatorio" },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe nao configurado" },
        { status: 500 }
      );
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ja inscrito neste curso" },
        { status: 400 }
      );
    }

    // Look up course in database for stripe_price_id
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, stripe_price_id, price_cents, currency")
      .eq("slug", courseSlug)
      .single();

    if (!course) {
      return NextResponse.json(
        { error: "Curso nao encontrado" },
        { status: 404 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      course.stripe_price_id
        ? [{ price: course.stripe_price_id, quantity: 1 }]
        : [
            {
              price_data: {
                currency: (course.currency || "usd").toLowerCase(),
                product_data: { name: course.title },
                unit_amount: course.price_cents || 4900,
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/cursos/${courseSlug}/dashboard?success=true`,
      cancel_url: `${baseUrl}/cursos/${courseSlug}?cancelled=true`,
      customer_email: user.email || undefined,
      metadata: {
        user_id: user.id,
        course_slug: courseSlug,
        course_id: course.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
