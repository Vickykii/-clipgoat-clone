"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Loader2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/lib/providers/toast-context";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const result = await signIn("email", {
      email,
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      toast({ title: "Unable to send magic link", description: result.error });
    } else {
      toast({ title: "Check your inbox", description: "We sent you a secure login link." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">Welcome to ClipForge</h1>
        <p className="text-sm text-gray-400">Sign in with a magic link or continue with Google.</p>
      </div>
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />} Send magic link
        </Button>
      </form>
      <div className="relative">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" aria-hidden />
        <span className="relative mx-auto block w-max bg-black/40 px-4 text-xs uppercase tracking-wide text-gray-500">
          Or continue with
        </span>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-white/5 text-white hover:bg-white/10"
        onClick={() => signIn("google")}
      >
        <Chrome className="mr-2 h-4 w-4" /> Google
      </Button>
      <p className="text-xs text-gray-500">
        By signing in you agree to our <a href="/legal" className="text-white underline">Terms</a>.
        Please ensure you have the right to download and repurpose third-party content before ingesting it into ClipForge.
      </p>
    </div>
  );
}
