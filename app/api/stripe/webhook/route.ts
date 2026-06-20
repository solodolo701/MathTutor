import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

function getExpiresAt(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Default 31 days for monthly, 366 for annual
        const isAnnual = session.amount_total && session.amount_total > 500;
        const expiresAt = getExpiresAt(isAnnual ? 366 : 31);

        await supabase
          .from("profiles")
          .update({
            subscription_status: "premium",
            subscription_expires_at: expiresAt,
            stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ subscription_status: "free", subscription_expires_at: null })
          .eq("id", profile.id);
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id ?? null;

      if (customerId) {
        const expiresAt = getExpiresAt(31);
        await supabase
          .from("profiles")
          .update({ subscription_status: "premium", subscription_expires_at: expiresAt })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
