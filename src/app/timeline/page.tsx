"use client";

import Link from "next/link";
import { MoveRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalRadialTimeline } from "@/components/ui/legal-radial-timeline";
import { Calendar, Code, FileText, User, Clock } from "lucide-react";

const timelineData = [
  {
    id: 1,
    title: "Planning",
    date: "Jan 2024",
    content: "Project planning and requirements gathering phase.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Design",
    date: "Feb 2024",
    content: "UI/UX design and system architecture.",
    category: "Design",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Development",
    date: "Mar 2024",
    content: "Core features implementation and testing.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "Testing",
    date: "Apr 2024",
    content: "User testing and bug fixes.",
    category: "Testing",
    icon: User,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 5,
    title: "Release",
    date: "May 2024",
    content: "Final deployment and release.",
    category: "Release",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 10,
  },
];

export default function Timeline() {
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

      <div className="pt-20">
        <LegalRadialTimeline
          timelineData={timelineData}
          className="min-h-[calc(100vh-5rem)] rounded-none border-x-0 border-b-0"
          centerTitle="Timeline"
          centerSubtitle="Demo"
        />
      </div>
    </>
  );
}
