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
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "../ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

export function EditAcaraDialog({ acara, open, onOpenChange, onEditAcara }) {
  const [formData, setFormData] = useState({
    title: "",
    dateTime: new Date(),
    location: "",
    status: "",
    description: "",
    category: "",
    sendWa: false,
  });

  // Initialize form data when acara changes
  useEffect(() => {
    if (acara) {
      setFormData({
        title: acara.title,
        dateTime: new Date(acara.dateTime),
        location: acara.location,
        status: acara.status,
        description: acara.description || "",
        category: acara.category || "Meeting",
        sendWa: acara.sendWa || false,
      });
    }
  }, [acara]);

  // Handle status change effect on sendWa
  useEffect(() => {
    if (formData.status === "DONE") {
      setFormData((prev) => ({
        ...prev,
        sendWa: false,
      }));
    }
  }, [formData.status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAcara = {
      ...acara,
      title: formData.title,
      dateTime: formData.dateTime.toISOString(),
      location: formData.location,
      status: formData.status,
      description: formData.description,
      category: formData.category,
      sendWa: formData.sendWa,
    };

    onEditAcara(updatedAcara);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Name</Label>
            <Input
              id="title"
              placeholder="Enter event name"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex-1 justify-start text-left font-normal ${
                      !formData.dateTime && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateTime ? (
                      format(formData.dateTime, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateTime}
                    onSelect={(date) => {
                      if (date) {
                        const currentDateTime = formData.dateTime;
                        // Keep the current time when changing date
                        date.setHours(currentDateTime.getHours());
                        date.setMinutes(currentDateTime.getMinutes());
                        setFormData({ ...formData, dateTime: date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={format(formData.dateTime, "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newDateTime = new Date(formData.dateTime);
                  newDateTime.setHours(parseInt(hours, 10));
                  newDateTime.setMinutes(parseInt(minutes, 10));
                  setFormData({ ...formData, dateTime: newDateTime });
                }}
                className="w-[150px]"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter event location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-blue-500/20 hover:text-blue-500 ${
                  formData.status === "UPCOMING"
                    ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, status: "UPCOMING" })}
              >
                Upcoming
              </Card>
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-green-500/20 hover:text-green-500 ${
                  formData.status === "DONE"
                    ? "bg-green-500/10 text-green-500 ring-1 ring-green-500"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, status: "DONE" })}
              >
                Done
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
              placeholder="Enter event description"
              className="h-20"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
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
                disabled={formData.status === "DONE"}
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
                  !formData.title ||
                  !formData.dateTime ||
                  !formData.location ||
                  !formData.status
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
