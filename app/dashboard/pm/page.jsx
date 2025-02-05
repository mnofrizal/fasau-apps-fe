"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenancePage() {
  return (
    <main className="flex-1 p-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Previous Maintenance
        </h1>
        <p className="text-muted-foreground">
          View history of maintenance activities
        </p>
      </div>

      <Card className="border-border bg-card dark:border-gray-600 dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
        </CardHeader>
        {/* Maintenance history list will go here */}
      </Card>
    </main>
  );
}
