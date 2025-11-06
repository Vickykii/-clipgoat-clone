import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/clients/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event;
  try {
    if (!signature) {
      throw new Error("Missing signature");
    }
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook error", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (workspaceId) {
        await prisma.billing.upsert({
          where: { workspaceId },
          update: {
            plan: "pro",
            stripeCustomerId: session.customer?.toString() ?? undefined,
            stripeSubId: session.subscription?.toString() ?? undefined,
            renewsAt: session.expires_at ? new Date(session.expires_at * 1000) : null
          },
          create: {
            workspaceId,
            plan: "pro",
            stripeCustomerId: session.customer?.toString() ?? undefined,
            stripeSubId: session.subscription?.toString() ?? undefined,
            renewsAt: session.expires_at ? new Date(session.expires_at * 1000) : null
          }
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer?.toString();
      if (customerId) {
        await prisma.billing.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubId: subscription.id,
            plan: subscription.status === "active" ? "pro" : "free",
            renewsAt: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
          }
        });
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.lines?.data) {
        const minutes = invoice.lines.data
          .filter((line) => line.description?.includes("Render minutes"))
          .reduce((acc, line) => acc + (line.quantity ?? 0), 0);
        if (minutes > 0 && invoice.customer) {
          await prisma.billing.updateMany({
            where: { stripeCustomerId: invoice.customer.toString() },
            data: {
              usageMinutesThisPeriod: 0
            }
          });
        }
      }
      break;
    }
    default:
      break;
  }

  await prisma.webhookEvent.create({
    data: {
      provider: "stripe",
      raw: event as unknown as Record<string, unknown>
    }
  });

  return NextResponse.json({ received: true });
}
