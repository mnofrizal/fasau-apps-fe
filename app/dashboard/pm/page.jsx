"use client";
import PMScheduleDisplay from "@/components/pm-page/PMScheduleDisplay";
import MitraTable from "@/components/pm-page/MitraTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaintenancePage() {
  return (
    <main className="flex-1 p-8">
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">52 Week Schedule</TabsTrigger>
          <TabsTrigger value="mitra">Mitra</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <PMScheduleDisplay />
        </TabsContent>
        <TabsContent value="mitra">
          <MitraTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}
