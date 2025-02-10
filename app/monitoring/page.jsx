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
import { AlertCircle, Users } from "lucide-react";

export default function MonitoringPage() {
  const [autoScroll, setAutoScroll] = useState(true);
  const [showInProgressOnly, setShowInProgressOnly] = useState(false);
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
    <div className="min-h-screen bg-zinc-100 dark:bg-gray-900">
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
                    <div className="flex items-center gap-4">
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
                      <div className="flex items-center gap-2">
                        <Switch
                          id="in-progress"
                          checked={showInProgressOnly}
                          onCheckedChange={setShowInProgressOnly}
                        />
                        <label
                          htmlFor="in-progress"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Show In Progress Only
                        </label>
                      </div>
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
                  showInProgressOnly={showInProgressOnly}
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
                    {reports.length === 0 ? (
                      <CarouselItem className="">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-xl text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-gray-400 dark:text-gray-500" />
                          <div>Belum ada laporan terbaru</div>
                        </div>
                      </CarouselItem>
                    ) : (
                      reports.map((report, index) => (
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
                                <p
                                  className="mt-1 text-gray-700 dark:text-gray-300"
                                  title={report.description}
                                >
                                  {report.description.length > 50
                                    ? `${report.description.slice(0, 50)}...`
                                    : report.description}
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
                      ))
                    )}
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

            {acara.length > 0 && (
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
            )}

            {/* Manpower Status Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Manpower Status
                    </h2>
                  </div>
                  <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-400">
                      Total:{" "}
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        82
                      </span>
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
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
                      {[
                        {
                          company: "PT TAMAN INA JAYA",
                          count: 17,
                          color: "bg-red-50 dark:bg-red-900/20",
                          textColor: "text-red-600 dark:text-red-400",
                          borderColor: "border-red-200 dark:border-red-800",
                          percentage: 42.8,
                        },
                        {
                          company: "PT MUTIARA KAHAL",
                          count: 21,
                          color: "bg-green-50 dark:bg-green-900/20",
                          textColor: "text-green-600 dark:text-green-400",
                          borderColor: "border-green-200 dark:border-green-800",
                          percentage: 28.6,
                        },
                        {
                          company: "PT JSI",
                          count: 1,
                          color: "bg-yellow-50 dark:bg-yellow-900/20",
                          textColor: "text-yellow-600 dark:text-yellow-400",
                          borderColor:
                            "border-yellow-200 dark:border-yellow-800",
                          percentage: 14.3,
                        },
                        {
                          company: "PT TRIDAYA PUTRA",
                          count: 21,
                          color: "bg-purple-50 dark:bg-purple-900/20",
                          textColor: "text-purple-600 dark:text-purple-400",
                          borderColor:
                            "border-purple-200 dark:border-purple-800",
                          percentage: 8.6,
                        },
                        {
                          company: "KOPERASI RUSAMAS",
                          count: 9,
                          color: "bg-pink-50 dark:bg-pink-900/20",
                          textColor: "text-pink-600 dark:text-pink-400",
                          borderColor: "border-pink-200 dark:border-pink-800",
                          percentage: 5.7,
                        },
                        {
                          company: "PT TRISTAN",
                          count: 5,
                          color: "bg-indigo-50 dark:bg-indigo-900/20",
                          textColor: "text-indigo-600 dark:text-indigo-400",
                          borderColor:
                            "border-indigo-200 dark:border-indigo-800",
                          percentage: 2.9,
                        },
                        {
                          company: "PT TAMPOMAS",
                          count: 5,
                          color: "bg-teal-50 dark:bg-teal-900/20",
                          textColor: "text-teal-600 dark:text-teal-400",
                          borderColor: "border-teal-200 dark:border-teal-800",
                          percentage: 2.9,
                        },
                        {
                          company: "PT MITRA MULTI",
                          count: 2,
                          color: "bg-orange-50 dark:bg-orange-900/20",
                          textColor: "text-orange-600 dark:text-orange-400",
                          borderColor:
                            "border-orange-200 dark:border-orange-800",
                          percentage: 2.9,
                        },
                      ].map((manpower, index) => (
                        <CarouselItem key={index} className="">
                          <div
                            key={index}
                            className={`rounded-xl p-6 transition-all duration-200 hover:shadow-md ${manpower.color} order-blue-200 border ${manpower.borderColor}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`rounded-lg p-3 ${
                                    manpower.textColor.includes("red")
                                      ? "bg-red-100 dark:bg-red-900/30"
                                      : "bg-blue-100 dark:bg-blue-900/30"
                                  }`}
                                >
                                  <Users
                                    className={`h-7 w-7 ${manpower.textColor}`}
                                  />
                                </div>
                                <div>
                                  <p
                                    className={`text-2xl font-semibold ${manpower.textColor}`}
                                  >
                                    {manpower.company}
                                  </p>
                                  <p className="text-xl text-gray-600 dark:text-gray-400">
                                    Total Personil
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`rounded-xl px-5 py-3 ${
                                  manpower.textColor.includes("red")
                                    ? "bg-red-100 dark:bg-red-900/30"
                                    : "bg-blue-100 dark:bg-blue-900/30"
                                }`}
                              >
                                <p
                                  className={`text-4xl font-bold ${manpower.textColor}`}
                                >
                                  {manpower.count}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
