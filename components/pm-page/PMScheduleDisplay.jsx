"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pmSchedule, pmAssets, pmTeams } from "@/contants/mockData";

export default function PMScheduleDisplay() {
  const startDate = new Date("2025-01-01");
  const today = new Date();
  const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"];

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Get the first day of selected month
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  // Get the last day of selected month
  const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

  // Array of months in Indonesian
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

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

  // Generate weeks that contain days from selected month
  const getMonthWeeks = () => {
    const weeks = [];
    let currentDate = getMondayOfWeek(firstDayOfMonth);

    while (currentDate <= lastDayOfMonth) {
      // Check if any day in this week falls within the selected month
      const hasSelectedMonthDay = days.some((_, index) => {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + index);
        return date.getMonth() === selectedMonth;
      });

      if (hasSelectedMonthDay) {
        const weekDates = days.map((_, index) => {
          const date = new Date(currentDate);
          date.setDate(currentDate.getDate() + index);
          return date;
        });

        const { weekInCycle, weekInYear } = getWeekDetails(currentDate);
        const weekSchedule = pmSchedule[`week${weekInCycle}`];

        weeks.push({
          dates: weekDates,
          weekInCycle,
          weekInYear,
          schedule: weekSchedule,
        });

        // Move to next Monday
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    return weeks;
  };

  const monthWeeks = getMonthWeeks();

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Preventive Maintenance
          </h1>
          <p className="text-muted-foreground">
            Jadwal kegiatan maintenance hari ini
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month} {selectedYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {monthWeeks.map((week, weekIndex) => (
        <div key={weekIndex} className="space-y-4">
          <h2 className="text-lg font-semibold">
            Minggu ke-{week.weekInYear} (Pola Minggu {week.weekInCycle}) (
            {week.dates[0].toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}{" "}
            -{" "}
            {week.dates[4].toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
            )
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {days.map((day, index) => (
              <Card
                key={`${weekIndex}-${day}`}
                className={`${
                  week.dates[index].toDateString() === today.toDateString()
                    ? "border-2 border-primary/20 bg-gradient-to-br from-indigo-100 via-blue-50 to-background shadow-xl dark:from-indigo-500/10 dark:via-blue-500/5 dark:to-background"
                    : `bg-gradient-to-br ${
                        index % 3 === 0
                          ? "from-blue-50/50 to-background dark:from-blue-500/5"
                          : index % 3 === 1
                          ? "from-purple-50/50 to-background dark:from-purple-500/5"
                          : "from-indigo-50/50 to-background dark:from-indigo-500/5"
                      }`
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={`text-lg ${
                      week.dates[index].toDateString() === today.toDateString()
                        ? "text-primary font-bold"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {day} -{" "}
                        {week.dates[index].toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {week.dates[index].toDateString() ===
                        today.toDateString() && (
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            index % 3 === 0
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                              : index % 3 === 1
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                          }`}
                        >
                          Hari Ini
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {week.schedule[day]?.map((schedule, index) => {
                      const asset = pmAssets.find(
                        (a) => a.id === schedule.assetId
                      );
                      const team = Object.entries(pmTeams).find(
                        ([_, team], index) => index + 1 === schedule.teamId
                      )?.[1];
                      if (!asset || !team) return null;
                      return (
                        <div
                          key={index}
                          className={`rounded-lg border p-3 transition-colors hover:bg-muted/70 ${
                            index % 3 === 0
                              ? "bg-blue-50/50 dark:bg-blue-500/5"
                              : index % 3 === 1
                              ? "bg-purple-50/50 dark:bg-purple-500/5"
                              : "bg-indigo-50/50 dark:bg-indigo-500/5"
                          }`}
                        >
                          <h3
                            className={`mb-1 text-sm font-semibold ${
                              index % 3 === 0
                                ? "text-blue-700 dark:text-blue-400"
                                : index % 3 === 1
                                ? "text-purple-700 dark:text-purple-400"
                                : "text-indigo-700 dark:text-indigo-400"
                            }`}
                          >
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
                    {!week.schedule[day] && (
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
      ))}
    </div>
  );
}
