"use client";
import Navigation from "@/components/layout/Navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto">
        {/* <Sidebar /> */}
        {children}
      </div>
    </div>
  );
}
