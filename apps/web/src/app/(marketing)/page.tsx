import Link from "next/link";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Clock, Layers, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Automatic highlight detection",
    description: "GPT-4o powered scoring surfaces your most viral-worthy moments in seconds.",
    icon: Sparkles
  },
  {
    title: "Captioned, polished renders",
    description: "Burn-in karaoke captions, safe zones, and branded templates with one click.",
    icon: Layers
  },
  {
    title: "Works with YouTube & podcasts",
    description: "Paste a link or upload a file. We handle transcription, diarization, and smart cropping.",
    icon: Rocket
  }
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "per month",
    description: "10 minutes of transcription + 10 minutes rendering included.",
    cta: "Get started",
    href: "/auth/signin",
    features: ["1 workspace", "AI clip suggestions", "Editor & templates", "Export MP4 + SRT"]
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "300 minutes per month, brand kits, and exporting in all ratios.",
    cta: "Upgrade to Pro",
    href: "/dashboard/billing",
    featured: true,
    features: ["Team workspaces", "Brand kits", "Publish stubs", "Priority queue", "Usage overage tracking"]
  }
];

export default function MarketingHomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="gradient-bg absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
          <Badge className="border border-white/20 bg-white/10 text-white">New • ClipForge v1.0 now live</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Turn long-form content into viral clips in minutes
          </h1>
          <p className="max-w-3xl text-lg text-white/80">
            ClipForge ingests your YouTube videos or podcasts, finds the hooks worth sharing, and
            renders vertical, square, and horizontal clips with karaoke captions, emojis, and smart cropping.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/auth/signin">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="gap-2 text-white hover:bg-white/10" asChild>
              <Link href="#demo">
                Watch demo
                <Clock className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Stripe-secured billing
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" /> <strong>~12x faster</strong> than manual editing
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-gray-950 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-white/10 bg-gray-950/80">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-brand-400" />
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-white/10 bg-gray-950/90 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white">Flexible plans for creators and teams</h2>
            <p className="mt-3 text-lg text-white/70">Upgrade only when you’re ready to scale.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {pricing.map((tier) => (
              <Card
                key={tier.name}
                className={`relative border-white/10 ${tier.featured ? "bg-brand-500/10" : "bg-gray-950/80"}`}
              >
                {tier.featured ? (
                  <Badge className="absolute right-4 top-4 bg-brand-500 text-white">Popular</Badge>
                ) : null}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-2xl text-white">
                    {tier.name}
                    <span className="text-3xl font-bold">{tier.price}</span>
                  </CardTitle>
                  <CardDescription className="flex items-end gap-2 text-base text-gray-300">
                    {tier.description}
                    <span className="text-sm text-gray-500">{tier.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={tier.featured ? "default" : "secondary"} asChild>
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10 bg-gray-950 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-semibold text-white">Frequently asked questions</h2>
          <div className="mt-10 space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white">Can I use YouTube videos I don’t own?</h3>
              <p className="mt-2 text-sm text-gray-400">
                You are responsible for ensuring you have rights to download and repurpose any content. ClipForge
                provides tooling only and does not grant usage rights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">How long does rendering take?</h3>
              <p className="mt-2 text-sm text-gray-400">
                Most clips render in under two minutes. Longer clips or 4K sources may take slightly longer but remain
                in a prioritized queue on Pro plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Do you support teams?</h3>
              <p className="mt-2 text-sm text-gray-400">
                Yes. Invite collaborators to workspaces, share brand kits, and manage billing centrally.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-brand-500/10 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-semibold text-white">Ready to clip your next viral moment?</h2>
          <p className="max-w-2xl text-lg text-white/80">
            Join thousands of creators using ClipForge to publish more often without the editing grind.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/auth/signin">
              Launch dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
