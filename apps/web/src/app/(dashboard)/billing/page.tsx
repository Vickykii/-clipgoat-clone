import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/clients/stripe";
import { env } from "@/lib/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BillingPage() {
  const session = await getSession();
  if (!session?.workspace) {
    redirect("/auth/signin");
  }

  const billing = await prisma.billing.findUnique({ where: { workspaceId: session.workspace.id } });

  async function createCheckoutSession() {
    "use server";
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user?.email ?? undefined,
      line_items: [{ price: env.STRIPE_PRICE_MONTHLY, quantity: 1 }],
      metadata: {
        workspaceId: session.workspace?.id ?? ""
      },
      success_url: `${env.APP_URL}/dashboard/billing?success=1`,
      cancel_url: `${env.APP_URL}/dashboard/billing?cancelled=1`
    });
    if (!checkout.url) {
      throw new Error("Stripe checkout URL missing");
    }
    redirect(checkout.url);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-white/10 bg-gray-950/80">
        <CardHeader>
          <CardTitle className="text-white">Billing overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-300">
          <p>Current plan: <span className="font-semibold text-white">{billing?.plan ?? "free"}</span></p>
          <p>Usage minutes this period: {billing?.usageMinutesThisPeriod ?? 0}</p>
          <p>Renews at: {billing?.renewsAt ? billing.renewsAt.toLocaleDateString() : "N/A"}</p>
          <form action={createCheckoutSession}>
            <Button type="submit">Upgrade to Pro</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
