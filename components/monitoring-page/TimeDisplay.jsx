"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const month = currentTime
    .toLocaleString("en-US", { month: "long" })
    .toUpperCase();
  const day = currentTime.getDate();
  const weekday = currentTime.toLocaleString("en-US", { weekday: "long" });
  const time = currentTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <Card className="border-none bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg dark:from-orange-600 dark:to-orange-700">
      <CardContent className="flex items-center justify-center p-6">
        <div className="flex items-center space-x-3">
          <div className="text-6xl font-bold text-white">{day}</div>
          <div className="items-left flex flex-col">
            <div className="text-xl font-semibold text-orange-100 dark:text-orange-200">
              {currentTime
                .toLocaleString("id-ID", { month: "long" })
                .toUpperCase()}
            </div>
            <div className="text-left text-2xl font-bold text-white">
              {currentTime.toLocaleString("id-ID", { weekday: "long" })}
            </div>
          </div>
        </div>
        <div className="ml-6 text-5xl font-bold tracking-wide text-white">
          {currentTime
            .toLocaleString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
            .replace(/\./g, ":")}
        </div>
      </CardContent>
    </Card>
  );
}
