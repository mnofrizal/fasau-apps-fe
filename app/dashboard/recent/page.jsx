"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentTasksPage() {
  return (
    <main className="flex-1 p-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Recent Tasks</h1>
        <p className="text-muted-foreground">
          View your latest task activities
        </p>
      </div>

      <Card className="border-border bg-card dark:border-gray-600 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        {/* Recent tasks list will go here */}
      </Card>
    </main>
  );
}
