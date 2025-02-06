"use client";

import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import Navigation from "../../components/layout/Navigation";
import TaskTable from "../../components/monitoring-page/TaskTable";
import { Switch } from "@/components/ui/switch";
import Autoplay from "embla-carousel-autoplay";

const TimeDisplay = dynamic(
  () => import("../../components/monitoring-page/TimeDisplay"),
  {
    ssr: false,
  }
);
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import useMonitoringStore from "@/store/monitoring-store";
import { useSocket } from "@/components/socket-provider";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AcaraAPI } from "@/lib/api/acara";
import { TasksAPI } from "@/lib/api/tasks";
import TodayScheduleDisplay from "@/components/pm-page/TodayScheduleDisplay";
import { getReportsToday } from "@/lib/api/reports";

export default function MonitoringPage() {
  const [autoScroll, setAutoScroll] = useState(true);
  const {
    tasks,
    reports,
    acara,
    isLoading,
    error,
    initializeData,
    fetchTasks,
    fetchReports,
    fetchAcara,
  } = useMonitoringStore();
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    // Initial data fetch
    initializeData();

    // Socket event listeners
    socket.on("task_updated", () => {
      fetchTasks();
      toast({
        title: "Tasks Updated",
        description: "Task data has been refreshed with latest changes",
      });
    });

    socket.on("report_created", () => {
      fetchReports();
      toast({
        title: "New Report",
        description: "A new report has been added to the system",
      });
    });

    socket.on("acara_updated", () => {
      fetchAcara();
      toast({
        title: "Events Updated",
        description: "Event data has been refreshed with latest changes",
      });
    });

    return () => {
      socket.off("task_updated");
      socket.off("report_created");
      socket.off("acara_updated");
    };
  }, [toast]);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 md:col-span-9">
            {/* Task Monitoring Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="flex flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Monitoring Pekerjaan
                    </h2>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="auto-scroll"
                        checked={autoScroll}
                        onCheckedChange={setAutoScroll}
                      />
                      <label
                        htmlFor="auto-scroll"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Auto Scroll
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="rounded-xl bg-gray-100 px-4 py-2 dark:bg-gray-700">
                      <span className="text-2xl text-gray-600 dark:text-gray-400">
                        Total:{" "}
                      </span>
                      <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="rounded-xl bg-green-100 px-4 py-2 dark:bg-green-600/20">
                      <span className="text-2xl text-gray-600 dark:text-gray-400">
                        Selesai:{" "}
                      </span>
                      <span className="text-2xl font-semibold text-green-700 dark:text-white">
                        {
                          tasks.filter((task) => task.status === "COMPLETED")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <TaskTable
                  data={tasks}
                  autoScroll={autoScroll}
                  onToggleScroll={setAutoScroll}
                />
              </CardContent>
            </Card>

            {/* Recent Task Reports Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                  Laporan Terbaru
                </h2>
                <Carousel
                  opts={{
                    loop: true,
                    align: "start",
                  }}
                  plugins={[
                    Autoplay({
                      delay: 5000,
                    }),
                  ]}
                  className="w-full"
                >
                  <CarouselContent className="">
                    {reports.map((report, index) => (
                      <CarouselItem key={index} className="md:basis-1/2">
                        <div
                          key={report.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                        >
                          <div className="flex items-center space-x-4">
                            {report.evidence ? (
                              <img
                                src={report.evidence}
                                alt={report.pelapor}
                                className="h-20 w-20 rounded-xl"
                              />
                            ) : (
                              <div
                                className={`h-20 w-20 rounded-xl font-bold flex items-center justify-center text-3xl  ${
                                  report.category === "CM"
                                    ? "bg-green-200 text-green-700"
                                    : "bg-blue-200 text-blue-700"
                                }`}
                              >
                                {report.category}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {report.pelapor}
                                </h3>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(report.createdAt)
                                    .toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "2-digit",
                                    })
                                    .replace(/ /g, " ")}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {report.description}
                              </p>
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white
                            ${
                              report.category === "CM"
                                ? "bg-green-600"
                                : "bg-blue-600"
                            }`}
                                >
                                  {report.category === "CM"
                                    ? "Corrective Maintenance"
                                    : "Preventive Maintenance"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="col-span-12 space-y-6 md:col-span-3">
            <TimeDisplay />

            {/* Employee Tasks Card */}
            <TodayScheduleDisplay />

            {/* Acara Hari Ini Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                  Acara Hari Ini
                </h2>
                <div className="space-y-4">
                  {acara.map((event, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="mb-2 flex items-center space-x-3">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full bg-blue-600`}
                        >
                          <span className="text-xl font-semibold text-white">
                            {new Date(event.dateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <p className="text-xl text-gray-700 dark:text-gray-300">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
