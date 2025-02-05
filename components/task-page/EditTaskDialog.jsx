import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function EditTaskDialog({ task, open, onOpenChange, onEditTask }) {
  const [formData, setFormData] = useState({
    name: "",
    kategori: "",
    status: "",
    keterangan: "",
    sendWa: false,
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        kategori: task.kategori,
        status: task.status,
        keterangan: task.keterangan || "",
        sendWa: task.sendWa || false,
      });
    }
  }, [task]);

  // Handle status change effect on sendWa
  useEffect(() => {
    if (formData.status === "Completed") {
      setFormData((prev) => ({
        ...prev,
        sendWa: false,
      }));
    }
  }, [formData.status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTask = {
      ...task,
      name: formData.name,
      kategori: formData.kategori,
      status: formData.status,
      keterangan: formData.keterangan,
      sendWa: formData.sendWa,
    };

    onEditTask(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="Enter task name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.kategori}
              onValueChange={(value) =>
                setFormData({ ...formData, kategori: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-blue-500/20 hover:text-blue-500 ${
                  formData.status === "In Progress"
                    ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, status: "In Progress" })
                }
              >
                In Progress
              </Card>
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-green-500/20 hover:text-green-500 ${
                  formData.status === "Completed"
                    ? "bg-green-500/10 text-green-500 ring-1 ring-green-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, status: "Completed" })
                }
              >
                Completed
              </Card>
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-orange-500/20 hover:text-red-500 ${
                  formData.status === "Pending"
                    ? "bg-orange-500/10 text-red-500 ring-1 ring-red-500"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, status: "Pending" })}
              >
                Pending
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
                disabled={formData.status === "Completed"}
              />
              <Label htmlFor="sendWa">Info ke WA Grup</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90"
                disabled={
                  !formData.name || !formData.kategori || !formData.status
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
