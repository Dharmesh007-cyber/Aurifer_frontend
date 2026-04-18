"use client";

import Link from "next/link";
import { MoveRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedAIChat } from "@/components/ui/legal-ai-chat";

export default function Chat() {
  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">UI Components</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:text-white">
              <MoveRight className="w-4 h-4 rotate-180" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Chat Page */}
      <div className="pt-20">
        <AnimatedAIChat />
      </div>
    </>
  );
}
