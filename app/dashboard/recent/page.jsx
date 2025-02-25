"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecentTasksTable } from "@/components/recent-page/RecentTasksTable";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getReports, deleteReport, updateReport } from "@/lib/api/reports";

export default function RecentTasksPage() {
  const [reports, setReports] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmTemuanDialog, setConfirmTemuanDialog] = useState(false);
  const { toast } = useToast();
  const [editForm, setEditForm] = useState({
    description: "",
    pelapor: "",
    phone: "",
    category: "PM",
    subCategory: "LAPORAN",
    tindakan: "",
  });

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
    setEditForm({
      description: report.description,
      pelapor: report.pelapor,
      phone: report.phone,
      category: report.category,
      subCategory: report.subCategory || "LAPORAN",
      tindakan: report.tindakan || "",
    });
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

      <RecentTasksTable
        reports={reports}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className={`p-0 transition-all ${
            editForm.subCategory === "TEMUAN"
              ? "sm:max-w-[900px]"
              : "sm:max-w-[500px]"
          }`}
        >
          <motion.div
            layout
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6"
          >
            <DialogHeader className="">
              <DialogTitle className="text-xl">Edit Report</DialogTitle>
            </DialogHeader>

            <motion.div layout className="py-4">
              <div className="grid grid-cols-[400px,1fr] gap-6">
                <div className="space-y-6">
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                      <svg
                        className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-slate-500"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{editForm.pelapor}</div>
                      <div className="text-sm text-muted-foreground">
                        {editForm.phone}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter report description"
                      className="h-32"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label>Category</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                          editForm.category === "PM"
                            ? "bg-blue-50 text-blue-600 ring-1 ring-blue-600 dark:bg-blue-600 dark:text-white"
                            : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                        onClick={() =>
                          setEditForm({ ...editForm, category: "PM" })
                        }
                      >
                        PM
                      </button>
                      <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${
                          editForm.category === "CM"
                            ? "bg-green-50 text-green-600 ring-1 ring-green-600 dark:bg-green-600 dark:text-white"
                            : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                        onClick={() =>
                          setEditForm({ ...editForm, category: "CM" })
                        }
                      >
                        CM
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label>Sub Category</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-yellow-50 hover:text-yellow-600 ${
                          editForm.subCategory === "TEMUAN"
                            ? "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-600 dark:bg-yellow-600 dark:text-white"
                            : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                        onClick={() => setConfirmTemuanDialog(true)}
                      >
                        Temuan
                      </button>
                      <button
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                          editForm.subCategory === "LAPORAN"
                            ? "bg-purple-50 text-purple-600 ring-1 ring-purple-600 dark:bg-purple-600 dark:text-white"
                            : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                        onClick={() =>
                          setEditForm({ ...editForm, subCategory: "LAPORAN" })
                        }
                      >
                        Laporan
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {editForm.subCategory === "TEMUAN" && (
                    <motion.div
                      initial={{ opacity: 0, width: 0, x: 20 }}
                      animate={{ opacity: 1, width: "100%", x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -20 }}
                      transition={{
                        duration: 0.3,
                        opacity: { delay: 0.1 },
                      }}
                      className="relative flex h-full flex-col pl-6"
                    >
                      <div className="absolute left-0 top-0 h-full w-[1px] bg-border" />
                      <div className="flex flex-1 flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Last Update:{" "}
                            {new Date(
                              reportToEdit?.updatedAt
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            ,{" "}
                            {new Date(
                              reportToEdit?.updatedAt
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <Badge
                            variant={
                              reportToEdit?.status === "COMPLETED"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {reportToEdit?.status}
                          </Badge>
                        </div>
                        <Tabs defaultValue="action" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="action">Tindakan</TabsTrigger>
                            <TabsTrigger value="history">
                              Status History
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="action" className="mt-2">
                            <Textarea
                              id="action"
                              placeholder="Enter action taken"
                              className="min-h-[350px] flex-1"
                              value={editForm.tindakan}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  tindakan: e.target.value,
                                })
                              }
                            />
                          </TabsContent>
                          <TabsContent value="history" className="mt-2">
                            <div className="rounded-md p-6 px-2">
                              <div className="space-y-8">
                                {[...(reportToEdit?.statusHistory || [])]
                                  .reverse()
                                  .map((history, index, reversedArray) => (
                                    <div key={index} className="relative">
                                      {index !==
                                        reportToEdit.statusHistory.length -
                                          1 && (
                                        <div className="absolute left-6 top-8 h-full w-px bg-border" />
                                      )}
                                      <div className="flex gap-3">
                                        <div
                                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${
                                            history.status === "COMPLETED"
                                              ? "bg-green-50 text-green-600"
                                              : "bg-slate-50 text-slate-600"
                                          }`}
                                        >
                                          {history.status === "COMPLETED" ? (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="20"
                                              height="20"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                          ) : (
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="20"
                                              height="20"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <circle cx="12" cy="12" r="10" />
                                              <path d="M12 8v4" />
                                              <path d="M12 16h.01" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex flex-1 flex-col py-2">
                                          <div className="flex items-center justify-between gap-2">
                                            <Badge
                                              variant={
                                                history.status === "COMPLETED"
                                                  ? "success"
                                                  : "secondary"
                                              }
                                            >
                                              {history.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(
                                                history.createdAt
                                              ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                              {", "}
                                              {new Date(
                                                history.createdAt
                                              ).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          </div>
                                          <div className="mt-1 flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                              {history.changedBy}
                                            </span>
                                          </div>
                                          <p className="mt-1 text-sm text-muted-foreground">
                                            {history.notes}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const result = await updateReport(
                      reportToEdit.id,
                      editForm
                    );
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
                        description:
                          result.message || "Failed to update report",
                      });
                    }
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description:
                        "An error occurred while updating the report",
                    });
                    console.error("Error updating report:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="bg-primary px-6 hover:bg-primary/90"
                disabled={isLoading || !editForm.description}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmTemuanDialog}
        onOpenChange={setConfirmTemuanDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin akan mengubah laporan ini ke kategori Task? Ini
              akan menjadikan report ke kategori Task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditForm({ ...editForm, subCategory: "TEMUAN" });
                setConfirmTemuanDialog(false);
              }}
            >
              Ya, Ubah
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
