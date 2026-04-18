"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles, Zap, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: LucideIcon;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
};

type Props = {
  timelineData: TimelineItem[];
  className?: string;
  centerTitle?: string;
  centerSubtitle?: string;
};

const statusStyles = {
  completed: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
  "in-progress": "bg-amber-500/15 text-amber-100 border-amber-300/20",
  pending: "bg-white/10 text-white/70 border-white/10",
};

export function LegalRadialTimeline({
  timelineData,
  className,
  centerTitle = "Project pulse",
  centerSubtitle = "Past matters",
}: Props) {
  const [activeId, setActiveId] = useState(timelineData[0]?.id ?? 0);
  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(220);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItem = useMemo(
    () => timelineData.find((item) => item.id === activeId) ?? timelineData[0],
    [activeId, timelineData]
  );
  const relatedIds = new Set(activeItem?.relatedIds ?? []);

  useEffect(() => {
    const updateRadius = () => {
      const width = containerRef.current?.offsetWidth ?? window.innerWidth;
      setRadius(width < 640 ? 112 : width < 960 ? 160 : 220);
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const id = window.setInterval(() => setRotation((current) => (current + 0.22) % 360), 24);
    return () => window.clearInterval(id);
  }, [autoRotate]);

  const focusItem = (itemId: number) => {
    const index = timelineData.findIndex((item) => item.id === itemId);
    const angle = (index / timelineData.length) * 360;
    setActiveId(itemId);
    setAutoRotate(false);
    setRotation(270 - angle);
  };

  return (
    <div className={cn("overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_26%),linear-gradient(180deg,#081120_0%,#030712_100%)] text-white shadow-[0_40px_100px_rgba(2,8,23,0.58)]", className)}>
      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-10">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-sky-200 uppercase">
            <Sparkles className="size-3.5" />
            Radial timeline
          </div>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight">{activeItem?.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">{activeItem?.content}</p>
          <div className={cn("mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-medium", statusStyles[activeItem?.status ?? "pending"])}>
            {activeItem?.status.replace("-", " ")}
          </div>
          <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/75">
            <div className="flex items-center justify-between"><span>Date</span><span>{activeItem?.date}</span></div>
            <div className="flex items-center justify-between"><span>Category</span><span>{activeItem?.category}</span></div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/45"><span>Energy</span><span>{activeItem?.energy}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-200" style={{ width: `${activeItem?.energy ?? 0}%` }} /></div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Connected matters</p>
            {(activeItem?.relatedIds ?? []).map((relatedId) => {
              const related = timelineData.find((item) => item.id === relatedId);
              if (!related) return null;
              return (
                <button key={relatedId} type="button" onClick={() => focusItem(relatedId)} className="flex w-full items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/75 transition hover:border-sky-400/25 hover:bg-white/[0.06] hover:text-white">
                  <span>{related.title}</span>
                  <ArrowRight className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div ref={containerRef} className="relative min-h-[520px]">
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20 bg-sky-400/10 shadow-[0_0_60px_rgba(56,189,248,0.22)]">
            <div className="absolute inset-3 rounded-full border border-white/15 bg-[#09101d]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">{centerSubtitle}</span>
              <span className="mt-1 text-sm font-medium">{centerTitle}</span>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 size-[440px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
          <div className="absolute left-1/2 top-1/2 size-[310px] max-w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6" />

          {timelineData.map((item, index) => {
            const angle = ((index / timelineData.length) * 360 + rotation) % 360;
            const radians = (angle * Math.PI) / 180;
            const x = radius * Math.cos(radians);
            const y = radius * Math.sin(radians);
            const depth = (Math.sin(radians) + 1) / 2;
            const Icon = item.icon;
            const active = item.id === activeId;
            const related = relatedIds.has(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => focusItem(item.id)}
                className="absolute transition"
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: `translate(-50%, -50%) scale(${0.86 + depth * 0.22})`, opacity: 0.45 + depth * 0.55 }}
              >
                <div className={cn("flex size-12 items-center justify-center rounded-full border text-white shadow-[0_0_30px_rgba(14,165,233,0.12)] transition", active ? "border-sky-300 bg-sky-400 text-slate-950" : related ? "border-cyan-200/40 bg-cyan-300/15" : "border-white/15 bg-[#0a1324]")}>
                  <Icon className="size-4.5" />
                </div>
                <div className={cn("mt-3 whitespace-nowrap text-center text-xs font-medium", active ? "text-white" : "text-white/60")}>{item.title}</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-white/35"><Zap className="size-3" />{item.energy}%</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
