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
    nama: "",
    tanggal: new Date(),
    waktu: "",
    lokasi: "",
    status: "",
    keterangan: "",
    sendWa: false,
  });

  // Initialize form data when acara changes
  useEffect(() => {
    if (acara) {
      setFormData({
        nama: acara.nama,
        tanggal: new Date(acara.tanggal),
        waktu: acara.waktu,
        lokasi: acara.lokasi,
        status: acara.status,
        keterangan: acara.keterangan || "",
        sendWa: acara.sendWa || false,
      });
    }
  }, [acara]);

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
    const updatedAcara = {
      ...acara,
      nama: formData.nama,
      tanggal: format(formData.tanggal, "d MMM yyyy"),
      waktu: formData.waktu,
      lokasi: formData.lokasi,
      status: formData.status,
      keterangan: formData.keterangan,
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
            <Label htmlFor="nama">Event Name</Label>
            <Input
              id="nama"
              placeholder="Enter event name"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tanggal">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formData.tanggal && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.tanggal ? (
                    format(formData.tanggal, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.tanggal}
                  onSelect={(date) =>
                    setFormData({ ...formData, tanggal: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="waktu">Time</Label>
            <Input
              id="waktu"
              type="time"
              value={formData.waktu}
              onChange={(e) =>
                setFormData({ ...formData, waktu: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lokasi">Location</Label>
            <Input
              id="lokasi"
              placeholder="Enter event location"
              value={formData.lokasi}
              onChange={(e) =>
                setFormData({ ...formData, lokasi: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <div className="grid grid-cols-3 gap-2">
              <Card
                className={`rounded-md cursor-pointer p-3 text-center shadow-none border-gray-200 transition-colors hover:bg-blue-500/20 hover:text-blue-500 ${
                  formData.status === "Upcoming"
                    ? "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500"
                    : ""
                }`}
                onClick={() => setFormData({ ...formData, status: "Upcoming" })}
              >
                Upcoming
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
                  formData.status === "Cancelled"
                    ? "bg-orange-500/10 text-red-500 ring-1 ring-red-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, status: "Cancelled" })
                }
              >
                Cancelled
              </Card>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keterangan">Description</Label>
            <Textarea
              id="keterangan"
              placeholder="Enter event description"
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
                  !formData.nama ||
                  !formData.tanggal ||
                  !formData.waktu ||
                  !formData.lokasi ||
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
