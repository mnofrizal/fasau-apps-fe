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
import {
  recentTaskReports,
  todayTasks,
  monitoringTasks,
  todayEvents,
} from "../../contants/mockData";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AcaraAPI } from "@/lib/api/acara";
import { TasksAPI } from "@/lib/api/tasks";

export default function MonitoringPage() {
  const [autoScroll, setAutoScroll] = useState(true);
  const [acara, setAcara] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await TasksAPI.getAllTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("An error occurred while fetching tasks");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcara();
  }, []);

  const fetchAcara = async () => {
    try {
      setIsLoading(true);
      const response = await AcaraAPI.getAllAcara();
      if (response.success) {
        setAcara(response.data);
      } else {
        setError(response.message || "Failed to fetch acara");
      }
    } catch (err) {
      setError("An error occurred while fetching acara");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 md:col-span-8">
            {/* Task Monitoring Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="flex flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Task Monitoring
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
                    <div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Tasks:{" "}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="rounded-lg bg-green-100 px-4 py-2 dark:bg-green-600/20">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Completed:{" "}
                      </span>
                      <span className="text-lg font-semibold text-green-700 dark:text-white">
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
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  Recent Task Reports
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
                    {recentTaskReports.map((report, index) => (
                      <CarouselItem key={index} className="md:basis-1/2">
                        <div
                          key={report.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={report.image}
                              alt={report.employee}
                              className="h-12 w-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {report.employee}
                                </h3>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {report.time}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {report.task}
                              </p>
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white
                            ${
                              report.status === "Completed"
                                ? "bg-green-600"
                                : "bg-blue-600"
                            }`}
                                >
                                  {report.status}
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
          <div className="col-span-12 space-y-6 md:col-span-4">
            <TimeDisplay />

            {/* Employee Tasks Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  PM Hari Ini
                </h2>
                <div className="flex justify-between space-x-4">
                  {todayTasks.map((item, index) => (
                    <div
                      key={index}
                      className="h-full w-full rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="mb-3 flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600">
                          <span className="text-lg font-semibold text-white">
                            {item.employee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.employee}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {item.tasks.map((task, taskIndex) => (
                          <li
                            key={taskIndex}
                            className="flex items-center space-x-2 text-base text-gray-700 dark:text-gray-300"
                          >
                            <span className="h-2 w-2 rounded-full bg-orange-400" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Acara Hari Ini Card */}
            <Card className="bg-white shadow-lg dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
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
                          <span className="text-lg font-semibold text-white">
                            {new Date(event.dateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <p className="text-base text-gray-700 dark:text-gray-300">
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
