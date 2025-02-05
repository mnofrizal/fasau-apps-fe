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
    const weeksDiff = Math.floor(
      (date - startDate) / (7 * 24 * 60 * 60 * 1000)
    );
    const weekInYear = Math.floor(weeksDiff % 52) + 1;
    const weekInCycle = (weeksDiff % 4) + 1;
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
                    ? "border-primary"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {day} -{" "}
                    {week.dates[index].toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
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
