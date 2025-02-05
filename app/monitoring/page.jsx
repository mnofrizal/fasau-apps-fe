"use client";

import dynamic from "next/dynamic";
import React from "react";
import Navigation from "./components/Navigation";
import TaskTable from "./components/TaskTable";
import { Switch } from "@/components/ui/switch";

const TimeDisplay = dynamic(() => import("./components/TimeDisplay"), {
  ssr: false,
});
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import {
  recentTaskReports,
  todayTasks,
  monitoringTasks,
  todayEvents,
} from "./data/mockData";

export default function MonitoringPage() {
  const [autoScroll, setAutoScroll] = useState(true);
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6 md:col-span-8">
            {/* Task Monitoring Card */}
            <Card className="bg-gray-800 shadow-lg">
              <CardContent className="flex flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold text-white">
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
                        className="text-sm font-medium text-gray-300"
                      >
                        Auto Scroll
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-gray-700 px-4 py-2">
                      <span className="text-sm text-gray-400">
                        Total Tasks:{" "}
                      </span>
                      <span className="text-lg font-semibold text-white">
                        {monitoringTasks.length}
                      </span>
                    </div>
                    <div className="rounded-lg bg-green-600/20 px-4 py-2">
                      <span className="text-sm text-gray-400">Completed: </span>
                      <span className="text-lg font-semibold text-white">
                        {
                          monitoringTasks.filter(
                            (task) => task.status === "Completed"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <TaskTable
                  data={monitoringTasks}
                  autoScroll={autoScroll}
                  onToggleScroll={setAutoScroll}
                />
              </CardContent>
            </Card>

            {/* Recent Task Reports Card */}
            <Card className="bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  Recent Task Reports
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {recentTaskReports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-xl border border-gray-600 bg-gray-700 p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={report.image}
                          alt={report.employee}
                          className="h-12 w-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">
                              {report.employee}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {report.time}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-300">{report.task}</p>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${
                              report.status === "Completed"
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="col-span-12 space-y-6 md:col-span-4">
            <TimeDisplay />

            {/* Employee Tasks Card */}
            <Card className="bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  PM Hari Ini
                </h2>
                <div className="flex justify-between space-x-4">
                  {todayTasks.map((item, index) => (
                    <div
                      key={index}
                      className="h-full w-full rounded-xl border border-gray-600 bg-gray-700 p-4 shadow-sm"
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
                        <h3 className="text-lg font-semibold text-white">
                          {item.employee}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {item.tasks.map((task, taskIndex) => (
                          <li
                            key={taskIndex}
                            className="flex items-center space-x-2 text-base text-gray-300"
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
            <Card className="bg-gray-800 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  Acara Hari Ini
                </h2>
                <div className="space-y-4">
                  {todayEvents.map((event, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-600 bg-gray-700 p-4 shadow-sm"
                    >
                      <div className="mb-2 flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-${event.color}-600`}
                        >
                          <span className="text-lg font-semibold text-white">
                            {event.time}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {event.title}
                          </h3>
                          <p className="text-base text-gray-300">
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
