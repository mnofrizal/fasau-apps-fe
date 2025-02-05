"use client";
import PMScheduleDisplay from "@/components/pm-page/PMScheduleDisplay";

export default function MaintenancePage() {
  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Preventive Maintenance
        </h1>
        <p className="text-muted-foreground">
          Jadwal kegiatan maintenance hari ini
        </p>
      </div>

      <div className="grid gap-6">
        <PMScheduleDisplay />
      </div>
    </main>
  );
}
