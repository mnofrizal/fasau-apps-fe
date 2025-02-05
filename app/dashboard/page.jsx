"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="flex-1 p-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
        {/* Task Card */}
        <Link href="/dashboard/tasks">
          <Card className="cursor-pointer border-border bg-card p-4 transition-colors hover:bg-orange-500/10 dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl text-primary">Tasks</CardTitle>
              <p className="mt-4 text-lg text-muted-foreground">
                View and manage your tasks
              </p>
            </CardHeader>
          </Card>
        </Link>

        {/* Recent Tasks Card */}
        <Link href="/dashboard/tasks">
          <Card className="cursor-pointer border-border bg-card p-4 transition-colors hover:bg-orange-500/10 dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl text-primary">
                Recent Tasks
              </CardTitle>
              <p className="mt-4 text-lg text-muted-foreground">
                Check your latest activities
              </p>
            </CardHeader>
          </Card>
        </Link>

        {/* Previous Maintenance Card */}
        <Link href="/dashboard/pm">
          <Card className="cursor-pointer border-border bg-card p-4 transition-colors hover:bg-orange-500/10 dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl text-primary">
                Previous Maintenance
              </CardTitle>
              <p className="mt-4 text-lg text-muted-foreground">
                View maintenance history
              </p>
            </CardHeader>
          </Card>
        </Link>

        {/* Acara Card */}
        <Link href="/dashboard/acara">
          <Card className="cursor-pointer border-border bg-card p-4 transition-colors hover:bg-orange-500/10 dark:border-gray-600 dark:bg-gray-800">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl text-primary">Acara</CardTitle>
              <p className="mt-4 text-lg text-muted-foreground">
                Manage upcoming events
              </p>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </main>
  );
}
