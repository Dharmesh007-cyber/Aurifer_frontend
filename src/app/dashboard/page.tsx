import { Suspense } from "react";
import DashboardWorkflow from "@/components/dashboard-workflow";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardWorkflow />
    </Suspense>
  );
}
