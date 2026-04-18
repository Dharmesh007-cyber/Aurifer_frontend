"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export type Testimonial = {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
};

type Status =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  fullScreen?: boolean;
  className?: string;
  submitLabel?: string;
  submitting?: boolean;
  status?: Status;
};

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.917Z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.337-17.694 10.691Z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 0 1-4.084 5.571l6.19 5.238C42.022 35.027 44 30.038 44 24c0-2.641-.21-5.236-.611-7.917Z" />
  </svg>
);

export function LegalSignIn({
  title = <span className="font-light tracking-tight text-slate-950">Welcome back</span>,
  description = "Access your workspace, continue active matters, and export reviewed drafts.",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  fullScreen = false,
  className,
  submitLabel = "Sign In",
  submitting = false,
  status = null,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("grid overflow-hidden bg-white", fullScreen ? "min-h-[calc(100dvh-5rem)] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]" : "min-h-[780px] rounded-[2rem] border border-slate-200 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]", className)}>
      <section className="flex items-center justify-center px-6 py-10 md:px-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>

          <form className="mt-8 space-y-5" onSubmit={onSignIn}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-500">Email address</span>
              <input name="email" type="email" placeholder="name@company.com" className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-500">Password</span>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-sm outline-none transition focus:border-sky-400 focus:bg-white" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-700">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-3 text-slate-600">
                <input type="checkbox" name="rememberMe" className="size-4 rounded border-slate-300" />
                Keep me signed in
              </label>
              <button type="button" onClick={onResetPassword} className="text-sky-600 transition hover:text-sky-700">
                Reset password
              </button>
            </div>

            {status && (
              <div className={cn("rounded-[1.25rem] border px-4 py-3 text-sm", status.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700")}>
                {status.message}
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full rounded-[1.25rem] bg-slate-950 py-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Signing in..." : submitLabel}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <span className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-4 text-sm text-slate-400">Or continue with</span>
          </div>

          <button type="button" onClick={onGoogleSignIn} className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-slate-200 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <button type="button" onClick={onCreateAccount} className="font-medium text-sky-600 transition hover:text-sky-700">
              Create account
            </button>
          </p>
        </div>
      </section>

      {heroImageSrc && (
        <section className="relative hidden min-h-[420px] md:block">
          <Image src={heroImageSrc} alt="Legal workspace preview" fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" priority={!fullScreen} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.56))]" />
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-8 right-8 grid gap-4 xl:grid-cols-2">
              {testimonials.slice(0, 2).map((testimonial) => (
                <div key={testimonial.handle} className="rounded-[1.5rem] border border-white/15 bg-white/12 p-4 text-white backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <Image src={testimonial.avatarSrc} alt={testimonial.name} width={44} height={44} className="rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-xs text-white/60">{testimonial.handle}</p>
                      <p className="mt-2 text-sm leading-6 text-white/80">{testimonial.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
