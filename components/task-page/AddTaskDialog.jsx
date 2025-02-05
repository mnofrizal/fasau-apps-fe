import { useState } from "react";
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
    category: "",
    status: "",
    keterangan: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await TasksAPI.createTask({
        title: formData.title,
        category: formData.category.toUpperCase(),
        status: formData.status.toUpperCase(),
        keterangan: formData.keterangan,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        onAddTask(response.data);
        setOpen(false);
        setFormData({
          title: "",
          category: "",
          status: "",
          keterangan: "",
        });
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMO">Memo</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="LAPORAN">Laporan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-blue-500/20 hover:text-blue-500 ${
                  formData.status === "INPROGRESS"
                    ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, status: "INPROGRESS" })
                }
              >
                In Progress
              </Card>
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-green-500/20 hover:text-green-500 ${
                  formData.status === "COMPLETED"
                    ? "bg-green-500/10 text-green-500 ring-1 ring-green-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, status: "COMPLETED" })
                }
              >
                Completed
              </Card>
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-orange-500/20 hover:text-red-500 ${
                  formData.status === "CANCEL"
                    ? "bg-orange-500/10 text-red-500 ring-1 ring-red-500"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, status: "CANCEL" })}
              >
                Cancel
              </Card>
            </div>
          </div>
          <div className="grid gap-2">
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
          <div className="flex justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="sendWa"
                checked={formData.sendWa}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendWa: checked })
                }
              />
              <Label htmlFor="sendWa">Info ke WA Grup</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
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
