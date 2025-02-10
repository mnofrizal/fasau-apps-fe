"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TasksAPI } from "@/lib/api/tasks";
import { WA_URL } from "@/lib/config";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Switch } from "../ui/switch";

export function AddTaskDialog({ onAddTask }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waStatus, setWaStatus] = useState("offline");
  const { toast } = useToast();

  useEffect(() => {
    const checkWaStatus = async () => {
      try {
        const response = await fetch(`${WA_URL}/status`);
        const data = await response.json();
        setWaStatus(
          data.success && data.status === "ready" ? "online" : "offline"
        );
      } catch (error) {
        console.error("Failed to check WA status:", error);
        setWaStatus("offline");
      }
    };

    const interval = setInterval(checkWaStatus, 30000); // Check every 30 seconds
    checkWaStatus(); // Initial check

    return () => clearInterval(interval);
  }, []);
  const [formData, setFormData] = useState({
    title: "",
    category: "MEMO",
    status: "BACKLOG",
    keterangan: "",
    sendWa: false,
  });

  // Load preferences from localStorage after mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      category: localStorage.getItem("taskCategoryPreference") || prev.category,
      status: localStorage.getItem("taskStatusPreference") || prev.status,
      sendWa:
        localStorage.getItem("taskSendWaPreference") === "true" || prev.sendWa,
    }));
  }, []);
  const [showDescription, setShowDescription] = useState(false);

  const toggleDescription = (show) => {
    setShowDescription(show);
    if (!show) {
      setFormData((prev) => ({ ...prev, keterangan: "" }));
    }
  };

  const handleSendWaChange = (checked) => {
    localStorage.setItem("taskSendWaPreference", checked);
    setFormData((prev) => ({ ...prev, sendWa: checked }));
  };

  const handleCategoryChange = (category) => {
    localStorage.setItem("taskCategoryPreference", category);
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleStatusChange = (status) => {
    localStorage.setItem("taskStatusPreference", status);
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: formData.title,
      category: formData.category.toUpperCase(),
      status: formData.status.toUpperCase(),
      keterangan: showDescription ? formData.keterangan : "",
      sendWa: formData.sendWa,
    };

    console.log("Save Task Payload:", payload);

    try {
      const response = await TasksAPI.createTask(payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        onAddTask(response.data);
        setOpen(false);
        setFormData((prev) => ({
          title: "",
          category: prev.category, // Preserve category preference
          status: prev.status, // Preserve status preference
          keterangan: "",
          sendWa: prev.sendWa, // Preserve sendWa preference
        }));
        setShowDescription(false); // Reset description visibility
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to create task",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the task",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">Add New Task</Button>
      </DialogTrigger>

      {/* <DialogOverlay className="backdrop-blur-[3px]" /> */}
      <DialogContent className="p-8 dark:bg-gray-800 sm:max-w-[650px]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold tracking-tight dark:text-gray-300">
              Add New Task
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                WA Server:
              </span>
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  waStatus === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <input
                id="title"
                placeholder="What needs to be done?"
                className="h-16 w-full rounded-md border border-input bg-transparent px-4 py-2 text-2xl font-medium text-gray-800 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-gray-700 dark:text-gray-200"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-muted-foreground dark:text-gray-400"
            >
              Category
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                  formData.category === "MEMO"
                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-600 dark:bg-blue-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("MEMO")}
              >
                Memo
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${
                  formData.category === "TASK"
                    ? "bg-green-50 text-green-600 ring-1 ring-green-600 dark:bg-green-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("TASK")}
              >
                Task
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                  formData.category === "LAPORAN"
                    ? "bg-purple-50 text-purple-600 ring-1 ring-purple-600 dark:bg-purple-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("LAPORAN")}
              >
                Laporan
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-yellow-50 hover:text-yellow-600 ${
                  formData.category === "JASA"
                    ? "bg-yellow-50 text-yellow-600 ring-1 ring-yellow-600 dark:bg-yellow-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("JASA")}
              >
                Jasa
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-pink-50 hover:text-pink-600 ${
                  formData.category === "MATERIAL"
                    ? "bg-pink-50 text-pink-600 ring-1 ring-pink-600 dark:bg-pink-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("MATERIAL")}
              >
                Material
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="status"
              className="text-sm font-medium text-muted-foreground dark:text-gray-400"
            >
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-600 ${
                  formData.status === "BACKLOG"
                    ? "bg-orange-50 text-orange-600 ring-1 ring-orange-600 dark:bg-orange-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleStatusChange("BACKLOG")}
              >
                Backlog
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                  formData.status === "INPROGRESS"
                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-600 dark:bg-blue-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleStatusChange("INPROGRESS")}
              >
                In Progress
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${
                  formData.status === "COMPLETED"
                    ? "bg-green-50 text-green-600 ring-1 ring-green-600 dark:bg-green-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleStatusChange("COMPLETED")}
              >
                Completed
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 ${
                  formData.status === "CANCEL"
                    ? "bg-red-50 text-red-600 ring-1 ring-red-600 dark:bg-red-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleStatusChange("CANCEL")}
              >
                Cancel
              </button>
            </div>
          </div>

          <div
            onClick={() => toggleDescription(!showDescription)}
            className="flex w-full cursor-pointer items-center justify-center rounded-md border py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50 dark:bg-gray-700 dark:text-gray-200"
          >
            {showDescription ? (
              <span className="text-red-700 dark:text-red-500">
                - Remove Description
              </span>
            ) : (
              "+ Add Description"
            )}
          </div>

          {showDescription && (
            <div className="space-y-3">
              <Textarea
                id="description"
                placeholder="Add any additional notes..."
                className="mt-2 h-24 resize-none dark:bg-gray-700 dark:text-gray-200"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="sendWa"
                checked={formData.sendWa}
                onCheckedChange={handleSendWaChange}
              />
              <Label htmlFor="sendWa" className="text-sm dark:text-gray-400">
                Info ke WA Grup
              </Label>
            </div>
            <div className="flex gap-3">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="font-medium dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                onClick={handleSubmit}
                className="bg-primary font-medium hover:bg-primary/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                disabled={
                  isLoading ||
                  !formData.title ||
                  !formData.category ||
                  !formData.status
                }
              >
                {isLoading ? "Saving..." : "Save Task"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
