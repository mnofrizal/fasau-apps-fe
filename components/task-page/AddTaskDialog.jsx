import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TasksAPI } from "@/lib/api/tasks";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "../ui/switch";

export function AddTaskDialog({ onAddTask }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: localStorage.getItem("taskCategoryPreference") || "MEMO",
    status: localStorage.getItem("taskStatusPreference") || "INPROGRESS",
    keterangan: "",
    sendWa: localStorage.getItem("taskSendWaPreference") === "true" || false,
  });
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
      <DialogContent className="p-8 sm:max-w-[650px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Add New Task
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <input
                id="title"
                placeholder="What needs to be done?"
                className="h-16 w-full rounded-md border border-input bg-transparent px-4 py-2 text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              className="text-sm font-medium text-muted-foreground"
            >
              Category
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                  formData.category === "MEMO"
                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleCategoryChange("MEMO")}
              >
                Memo
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${
                  formData.category === "TASK"
                    ? "bg-green-50 text-green-600 ring-1 ring-green-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleCategoryChange("TASK")}
              >
                Task
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-600 ${
                  formData.category === "LAPORAN"
                    ? "bg-purple-50 text-purple-600 ring-1 ring-purple-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleCategoryChange("LAPORAN")}
              >
                Laporan
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="status"
              className="text-sm font-medium text-muted-foreground"
            >
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                  formData.status === "INPROGRESS"
                    ? "bg-blue-50 text-blue-600 ring-1 ring-blue-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleStatusChange("INPROGRESS")}
              >
                In Progress
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-green-50 hover:text-green-600 ${
                  formData.status === "COMPLETED"
                    ? "bg-green-50 text-green-600 ring-1 ring-green-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleStatusChange("COMPLETED")}
              >
                Completed
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 ${
                  formData.status === "CANCEL"
                    ? "bg-red-50 text-red-600 ring-1 ring-red-600"
                    : "bg-slate-50 text-slate-600"
                }`}
                onClick={() => handleStatusChange("CANCEL")}
              >
                Cancel
              </button>
            </div>
          </div>

          <div
            onClick={() => toggleDescription(!showDescription)}
            className="flex w-full cursor-pointer items-center justify-center rounded-md border py-3 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
          >
            {showDescription ? (
              <span className="text-red-700">- Remove Description</span>
            ) : (
              "+ Add Description"
            )}
          </div>

          {showDescription && (
            <div className="space-y-3">
              <Textarea
                id="description"
                placeholder="Add any additional notes..."
                className="mt-2 h-24 resize-none"
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
              <Label htmlFor="sendWa" className="text-sm">
                Info ke WA Grup
              </Label>
            </div>
            <div className="flex gap-3">
              <DialogTrigger asChild>
                <Button variant="outline" className="font-medium">
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                onClick={handleSubmit}
                className="bg-primary font-medium hover:bg-primary/90"
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
