"use client";
import PMScheduleDisplay from "@/components/pm-page/PMScheduleDisplay";

export default function MaintenancePage() {
  return (
    <main className="flex-1 p-8">
      <div className="grid gap-6">
        <PMScheduleDisplay />
      </div>
    </main>
  );
}
