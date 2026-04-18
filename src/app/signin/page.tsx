export { default } from "@/components/signin-screen";
/*

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoveRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LegalSignIn } from "@/components/ui/legal-sign-in";

const sampleTestimonials = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "LegalAI has transformed how we handle compliance. The AI-generated documents are accurate and save us hundreds of hours.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "The document generation is incredible. We completed a full VAT audit in days instead of weeks.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Best investment we've made for our legal team. Intuitive, powerful, and genuinely helpful.",
  },
];

export default function SignIn() {
  const router = useRouter();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">LegalAI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <MoveRight className="w-4 h-4 rotate-180" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-20">
        <LegalSignIn
          fullScreen
          heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
          testimonials={sampleTestimonials}
          status={status}
          submitting={submitting}
          onSignIn={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "");
            setSubmitting(true);

            window.setTimeout(() => {
              if (!email.includes("@")) {
                setStatus({
                  type: "error",
                  message: "Enter a valid email address to continue.",
                });
              } else if (password.length < 8) {
                setStatus({
                  type: "error",
                  message: "Password must be at least 8 characters.",
                });
              } else {
                setStatus({
                  type: "success",
                  message: "Sign-in successful. Redirecting to your dashboard...",
                });
                window.setTimeout(() => {
                  router.push("/dashboard");
                }, 700);
              }
              setSubmitting(false);
            }, 500);
          }}
          onGoogleSignIn={() =>
            setStatus({
              type: "success",
              message:
                "Google sign-in is ready to connect to your OAuth provider.",
            })
          }
          onResetPassword={() => {
            setStatus({
              type: "success",
              message:
                "Password reset requested. In production this would email a recovery link.",
            });
          }}
          onCreateAccount={() =>
            setStatus({
              type: "success",
              message:
                "Account creation can branch into onboarding from this screen.",
            })
          }
        />
      </div>
    </>
  );
}
*/
