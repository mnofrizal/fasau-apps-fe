import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TasksAPI } from "@/lib/api/tasks";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "../ui/switch";

export function EditTaskDialog({ task, open, onOpenChange, onEditTask }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCategoryChange = (category) => {
    setFormData({ ...formData, category });
  };

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status });
  };

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    status: "",
    keterangan: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        category: task.category,
        status: task.status,
        keterangan: task.keterangan || "",
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await TasksAPI.updateTask(task.id, {
        title: formData.title,
        category: formData.category,
        status: formData.status,
        keterangan: formData.keterangan,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
        onEditTask(response.data);
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update task",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the task",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 px-7 sm:max-w-[500px]">
        <DialogHeader className="">
          <DialogTitle className="text-xl">Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-3">
            <Label>Category</Label>
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-teal-50 hover:text-teal-600 ${
                  formData.category === "TEMUAN"
                    ? "bg-teal-50 text-teal-600 ring-1 ring-teal-600 dark:bg-teal-600 dark:text-white"
                    : "bg-slate-50 text-slate-600 dark:bg-gray-700 dark:text-gray-200"
                }`}
                onClick={() => handleCategoryChange("TEMUAN")}
              >
                Temuan
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
          <div className="grid gap-3">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-600 ${
                  formData.status === "BACKLOG"
                    ? "bg-gray-50 text-gray-600 ring-1 ring-gray-600 dark:bg-gray-600 dark:text-white"
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
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              className="h-20"
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-4">
            {/* <div className="flex items-center space-x-2">
              <Switch
                id="sendWa"
                checked={formData.sendWa}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendWa: checked })
                }
              />
              <Label htmlFor="sendWa">Info ke WA Grup</Label>
            </div> */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary px-6 hover:bg-primary/90"
                disabled={
                  isLoading ||
                  !formData.title ||
                  !formData.category ||
                  !formData.status
                }
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
