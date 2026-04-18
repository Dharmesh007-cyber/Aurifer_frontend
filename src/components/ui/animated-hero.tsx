'use client'

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rotatingWords = ["tax", "compliance", "contracts", "filings"];

const heroPanels = [
  {
    title: "Matter orchestration",
    body: "Route every request from intake to final export with one shared workflow.",
    icon: Workflow,
  },
  {
    title: "AI review layer",
    body: "Flag filing gaps, missing clauses, and inconsistent numbers before delivery.",
    icon: Bot,
  },
  {
    title: "Audit-ready trail",
    body: "Keep source documents, comments, and generated drafts attached to each project.",
    icon: ShieldCheck,
  },
];

interface HeroProps {
  className?: string;
  primaryHref?: string;
  secondaryHref?: string;
}

function Hero({
  className,
  primaryHref = "#signin",
  secondaryHref = "#chat",
}: HeroProps) {
  const [activeWord, setActiveWord] = useState(0);

  const rotateWord = useEffectEvent(() => {
    setActiveWord((current) => (current + 1) % rotatingWords.length);
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      rotateWord();
    }, 2200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      className={cn(
        "relative overflow-hidden px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-24",
        className
      )}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,#fffdf7_0%,#f5f7fb_46%,#eef2ff_100%)]" />
      <div className="absolute inset-x-0 top-10 -z-10 h-72 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_62%)] blur-3xl" />

      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-medium tracking-[0.18em] text-sky-700 uppercase shadow-sm backdrop-blur"
          >
            <Sparkles className="size-3.5" />
            Momentext Legal AI Workspace
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="mt-8"
          >
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 md:text-7xl">
              Build every
              <span className="relative mx-3 inline-flex h-[1.05em] min-w-[4.7ch] overflow-hidden align-baseline text-sky-600">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={rotatingWords[activeWord]}
                    initial={{ opacity: 0, y: 32, rotateX: -60 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -30, rotateX: 60 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    {rotatingWords[activeWord]}
                  </motion.span>
                </AnimatePresence>
              </span>
              workflow on one intelligent surface.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Intake documents, draft filings, review risk, and hand projects to
              clients without stitching together six different tools. The main
              UI now carries the hero, parallax showcase, AI chat, sign-in, and
              past-project timeline in one flow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href={primaryHref}>
              <Button size="lg" className="gap-2 bg-slate-950 text-white hover:bg-slate-800">
                Enter Workspace
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href={secondaryHref}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-slate-300 bg-white/80 text-slate-800 hover:bg-slate-100"
              >
                Try The AI Chat
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
            className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3"
          >
            {[
              ["362", "active filings"],
              ["12 min", "average first draft"],
              ["98.2%", "review confidence"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-200/80 bg-white/70 px-5 py-4 shadow-sm backdrop-blur"
              >
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.7 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(245,158,11,0.08))] blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Live workspace snapshot
                </p>
                <p className="text-xl font-semibold tracking-tight text-slate-950">
                  Q2 compliance command center
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Ready to export
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {heroPanels.map((panel, index) => (
                <motion.div
                  key={panel.title}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="grid gap-4 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/90 p-4 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <panel.icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{panel.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {panel.body}
                    </p>
                  </div>
                  <div className="justify-self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 md:justify-self-end">
                    Stage {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-950 p-5 text-white sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Current matter
                </p>
                <p className="mt-2 text-lg font-medium">
                  Vendor contract pack for Meridian Group
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Source files indexed</span>
                  <span>18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clauses verified</span>
                  <span>42 / 45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Open review points</span>
                  <span>3</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { Hero };
