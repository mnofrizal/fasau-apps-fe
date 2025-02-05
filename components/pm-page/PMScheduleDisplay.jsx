"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pmSchedule, pmAssets, pmTeams } from "@/contants/mockData";

export default function PMScheduleDisplay() {
  // Get current week number (1-4)
  const startDate = new Date("2025-01-01");
  const today = new Date();
  const weeksDiff = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
  const currentWeekInCycle = (weeksDiff % 4) + 1;
  const weekSchedule = pmSchedule[`week${currentWeekInCycle}`];
  const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"];

  // Calculate dates for each weekday
  const getWeekDates = () => {
    const currentDate = new Date(today);
    const currentDay = currentDate.getDay();
    // Adjust to get Monday (first day of week)
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(currentDate.setDate(currentDate.getDate() + diff));

    return days.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Jadwal Minggu {currentWeekInCycle} -{" "}
            {today.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
            })}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {days.map((day, index) => (
          <Card
            key={day}
            className={`${
              day ===
              today.toLocaleString("id-ID", { weekday: "long" }).toUpperCase()
                ? "border-primary"
                : ""
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg">
                {day} -{" "}
                {weekDates[index].toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekSchedule[day]?.map((schedule, index) => {
                  const asset = pmAssets.find((a) => a.id === schedule.assetId);
                  const team = Object.values(pmTeams)[schedule.teamId - 1];
                  return (
                    <div
                      key={index}
                      className="rounded-lg border bg-muted/50 p-3"
                    >
                      <h3 className="mb-1 text-sm font-semibold">
                        {asset.name}
                      </h3>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {asset.description}
                      </p>
                      <div className="text-xs">
                        <span className="font-medium">{team.name}:</span>{" "}
                        {team.members.join(", ")}
                      </div>
                    </div>
                  );
                })}
                {!weekSchedule[day] && (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada jadwal
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
