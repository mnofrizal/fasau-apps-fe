"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pmSchedule, pmAssets, pmTeams } from "@/contants/mockData";

export default function TodayScheduleDisplay() {
  const startDate = new Date("2025-01-01");
  const today = new Date();
  const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"];

  // Function to get Monday date of a week containing the given date
  const getMondayOfWeek = (date) => {
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return new Date(new Date(date).setDate(date.getDate() + diff));
  };

  // Function to get week details (cycle number 1-4 and absolute week number 1-52)
  const getWeekDetails = (date) => {
    const weeksDiff = Math.floor(
      (date - startDate) / (7 * 24 * 60 * 60 * 1000)
    );
    const weekInYear = Math.floor(weeksDiff % 52) + 1;
    const weekInCycle = (weeksDiff % 4) + 1;
    return { weekInCycle, weekInYear };
  };

  // Get today's schedule
  const mondayOfWeek = getMondayOfWeek(today);
  const { weekInCycle, weekInYear } = getWeekDetails(mondayOfWeek);
  const weekSchedule = pmSchedule[`week${weekInCycle}`];

  // Get today's day name (SENIN, SELASA, etc)
  const dayIndex = today.getDay() - 1; // -1 because getDay() returns 0 for Sunday
  const dayName = days[dayIndex];

  return (
    <div className="space-y-8">
      <div>
        <Card className="bg-white shadow-lg dark:bg-gray-800">
          <CardContent className="p-6">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              PM Hari Ini (Minggu ke-{weekInYear})
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {weekSchedule[dayName]?.map((schedule, index) => {
                const asset = pmAssets.find((a) => a.id === schedule.assetId);
                const team = Object.entries(pmTeams).find(
                  ([_, team], index) => index + 1 === schedule.teamId
                )?.[1];
                if (!asset || !team) return null;
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-between rounded-lg border p-4 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <div>
                      <h2 className="mb-2 text-2xl font-semibold">
                        {asset.name}
                      </h2>
                      <p className="mb-3 text-base text-muted-foreground">
                        {asset.description}
                      </p>
                    </div>
                    <div className="mt-auto text-xl">
                      <span className="font-bold">{team.name}:</span>{" "}
                      {team.members.join(", ")}
                    </div>
                  </div>
                );
              })}
              {!weekSchedule[dayName] && (
                <p className="text-lg text-muted-foreground">
                  Tidak ada jadwal hari ini
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
