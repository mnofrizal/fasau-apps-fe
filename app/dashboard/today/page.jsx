"use client";
import TodayScheduleDisplay from "@/components/pm-page/TodayScheduleDisplay";

export default function TodayPage() {
  return (
    <main className="flex-1 p-8">
      <div className="grid gap-6">
        <TodayScheduleDisplay />
      </div>
    </main>
  );
}
