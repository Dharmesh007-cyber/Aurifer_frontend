"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { AuriferWordmark } from "@/components/ui/aurifer-wordmark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SigninScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[360px] bg-[radial-gradient(circle_at_top_left,rgba(245,147,60,0.2),transparent_30%),radial-gradient(circle_at_top_right,rgba(37,59,99,0.12),transparent_34%)]" />

      <nav className="border-b border-slate-200 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <AuriferWordmark size="sm" />
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full border-slate-300 bg-white px-4 text-[#000000] hover:border-[#ea8c47] hover:text-[#ea8c47]">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center lg:py-14">
        <section className="rounded-[2rem] border-2 border-[#ea8c47]/30 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-6 text-white shadow-2xl md:p-8">
          <h1>
            <AuriferWordmark size="lg" tone="light" />
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/85">
            AI-powered workspace
          </p>
        </section>

        <section className="rounded-[2rem] border-2 border-slate-200 bg-white p-6 shadow-xl md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ea8c47] to-[#f3b372] text-white">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#000000]">Welcome back</p>
              <p className="text-sm text-[#424242]">Enter any email and password to access the demo.</p>
            </div>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "").trim();
              const password = String(formData.get("password") ?? "");
              setSubmitting(true);

              // No backend validation - accept any input and redirect to dashboard
              window.setTimeout(() => {
                setStatus({ type: "success", message: "Sign-in successful. Redirecting to your dashboard..." });
                window.setTimeout(() => router.push("/dashboard"), 700);
                setSubmitting(false);
              }, 500);
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#000000]">Work Email</span>
              <input name="email" type="email" placeholder="name@company.com" className="h-12 w-full rounded-[1.3rem] border-2 border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#ea8c47] focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#000000]">Password</span>
              <input name="password" type="password" placeholder="Enter your password" className="h-12 w-full rounded-[1.3rem] border-2 border-slate-300 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#ea8c47] focus:bg-white" />
            </label>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-3 text-[#424242]">
                <input type="checkbox" name="rememberMe" className="size-4 rounded border-slate-300" />
                Keep me signed in
              </label>
              <button
                type="button"
                className="font-medium text-[#ea8c47] transition hover:text-[#f3b372]"
                onClick={() => setStatus({ type: "success", message: "Password reset is ready to be wired to your auth provider." })}
              >
                Reset password
              </button>
            </div>

            {status && (
              <div className={cn("rounded-[1.25rem] border-2 px-4 py-3 text-sm leading-6", status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700")}>
                {status.message}
              </div>
            )}

            <Button className="h-12 w-full rounded-full text-sm font-semibold bg-gradient-to-r from-[#ea8c47] to-[#f3b372] text-[#000000] hover:shadow-lg" disabled={submitting}>
              {submitting ? "Signing In..." : "Sign In"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="border-t-2 border-slate-200" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 text-xs font-medium uppercase tracking-[0.18em] text-[#424242]">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-2 border-slate-300 bg-white text-[#000000] hover:border-[#ea8c47] hover:text-[#ea8c47]"
            onClick={() => {
              setStatus({ type: "success", message: "Signing in with Google..." });
              window.setTimeout(() => router.push("/dashboard"), 700);
            }}
          >
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-[#424242]">
            Need the public site first?{" "}
            <Link href="/" className="font-medium text-[#ea8c47] transition hover:text-[#f3b372]">
              Go back to the landing page
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
