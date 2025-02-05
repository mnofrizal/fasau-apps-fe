"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <main className="flex-1 p-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Acara</h1>
        <p className="text-muted-foreground">Manage and view upcoming events</p>
      </div>

      <Card className="border-border bg-card dark:border-gray-600 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Event Schedule</CardTitle>
        </CardHeader>
        {/* Events list will go here */}
      </Card>
    </main>
  );
}
