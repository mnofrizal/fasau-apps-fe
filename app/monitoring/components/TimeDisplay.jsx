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
    <Card className="border-none bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg">
      <CardContent className="flex p-6">
        <div className="flex-1">
          <div className="mb-1 text-lg text-orange-200">{month}</div>
          <div className="mb-1 text-xl text-white">{weekday}</div>
          <div className="text-8xl font-bold text-white">{day}</div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="mt-4 text-7xl font-bold tracking-wide text-white">
            {time}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
