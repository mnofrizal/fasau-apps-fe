"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pmSchedule, pmAssets, pmTeams } from "@/contants/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
    // Get the ISO week number
    const target = new Date(date.getTime());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekInYear = 1 + Math.ceil((firstThursday - target) / 604800000);

    // Calculate cycle week (1-4) based on the week number
    const weekInCycle = ((weekInYear - 1) % 4) + 1;

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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-4xl font-bold text-primary">PM Hari Ini</h2>
              <div className="rounded-full bg-primary/10 px-4 py-2 text-lg font-semibold text-primary">
                Minggu ke-{weekInYear}
              </div>
            </div>
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
                      <h2 className="mb-2 text-3xl font-semibold">
                        {asset.name}
                      </h2>
                      <p className="mb-3 text-lg text-muted-foreground">
                        {asset.description}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-2 text-xl">
                        <span className="font-bold">{team.name}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {team.members.map((member, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 rounded-lg bg-gray-100 p-2.5 py-2.5 dark:bg-gray-800"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarImage />
                              <AvatarFallback
                                className={`text-white font-semibold text-xl ${
                                  i % 2 === 0 ? "bg-blue-500" : "bg-green-500"
                                }`}
                              >
                                {member
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xl font-medium text-gray-800 dark:text-gray-200">
                              {member}
                            </div>
                          </div>
                        ))}
                      </div>
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
