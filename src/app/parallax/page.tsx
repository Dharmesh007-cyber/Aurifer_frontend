"use client";

import Link from "next/link";
import { MoveRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZoomParallax } from "@/components/ui/zoom-parallax";

const parallaxImages = [
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Modern architecture building",
  },
  {
    src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Urban cityscape at sunset",
  },
  {
    src: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Abstract geometric pattern",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Mountain landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Minimalist design elements",
  },
  {
    src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Ocean waves and beach",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&h=720&fit=crop&crop=entropy&auto=format&q=80",
    alt: "Forest trees and sunlight",
  },
];

export default function Parallax() {
  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">UI Components</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <MoveRight className="w-4 h-4 rotate-180" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Parallax Page */}
      <main className="min-h-screen w-full pt-20">
        <div className="relative flex h-[50vh] items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--foreground)_1%,transparent_50%)] blur-[30px] opacity-10"
          />
          <h1 className="text-center text-4xl font-bold">
            Scroll Down for Zoom Parallax
          </h1>
        </div>
        <ZoomParallax images={parallaxImages} />
        <div className="h-[50vh]" />
      </main>
    </>
  );
}
