import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { stripe } from "@/lib/clients/stripe";
import { env } from "@/lib/env";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.workspace?.id || !session.user.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [
      {
        price: env.STRIPE_PRICE_MONTHLY,
        quantity: 1
      }
    ],
    metadata: {
      workspaceId: session.workspace.id
    },
    success_url: `${env.APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${env.APP_URL}/dashboard/billing?cancelled=1`
  });

  return NextResponse.json({ url: checkout.url });
}
