"use client";

import { useState, useEffect, useCallback } from "react";
import { exportToExcel, prepareReportData } from "@/lib/utils/export";
import { motion, AnimatePresence } from "framer-motion";
import { RecentTasksTable } from "@/components/recent-page/RecentTasksTable";
import { TemuanTable } from "@/components/recent-page/TemuanTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditRecentDialog } from "@/components/recent-page/EditRecentDialog";
import { useToast } from "@/hooks/use-toast";
import { getReports, deleteReport, updateReport } from "@/lib/api/reports";

export default function RecentTasksPage() {
  const [reports, setReports] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getReports();
        if (response.success) {
          const updatedReports = response.data.map((report) => ({
            ...report,
            subCategory: report.subCategory || "LAPORAN",
          }));
          setReports(updatedReports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const handleEdit = (report) => {
    setReportToEdit(report);
    setEditDialogOpen(true);
  };

  const handleDelete = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (report) => {
    console.log("View details for report:", report);
  };

  return (
    <main className="flex-1 space-y-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Recent Reports</h1>
        <p className="text-muted-foreground">
          View your latest report activities
        </p>
      </div>

      <Tabs defaultValue="laporan" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
            <TabsTrigger value="temuan">Rekap Temuan & Material</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const data = await prepareReportData(reports, "laporan");
                exportToExcel(data, "laporan-export", "laporan");
              }}
              variant="outline"
              size="sm"
            >
              Export Laporan
            </Button>
            <Button
              onClick={async () => {
                const data = await prepareReportData(reports, "temuan");
                exportToExcel(data, "temuan-export", "temuan");
              }}
              variant="outline"
              size="sm"
            >
              Export Temuan
            </Button>
          </div>
        </div>
        <TabsContent value="laporan">
          <RecentTasksTable
            reports={reports}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        <TabsContent value="temuan">
          <TemuanTable
            reports={reports}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                try {
                  await deleteReport(reportToDelete.id);
                  setDeleteDialogOpen(false);
                  const response = await getReports();
                  if (response.success) {
                    const updatedReports = response.data.map((report) => ({
                      ...report,
                      subCategory: report.subCategory || "LAPORAN",
                    }));
                    setReports(updatedReports);
                  }
                } catch (error) {
                  console.error("Error deleting report:", error);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditRecentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reportToEdit={reportToEdit}
        isLoading={isLoading}
        onSave={async (editForm) => {
          setIsLoading(true);
          try {
            const result = await updateReport(reportToEdit.id, editForm);
            if (result.success) {
              toast({
                title: "Success",
                description: "Report updated successfully",
              });
              setEditDialogOpen(false);
              const response = await getReports();
              if (response.success) {
                const updatedReports = response.data.map((report) => ({
                  ...report,
                  subCategory: report.subCategory || "LAPORAN",
                }));
                setReports(updatedReports);
              }
            } else {
              toast({
                variant: "destructive",
                title: "Error",
                description: result.message || "Failed to update report",
              });
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "An error occurred while updating the report",
            });
            console.error("Error updating report:", error);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </main>
  );
}
