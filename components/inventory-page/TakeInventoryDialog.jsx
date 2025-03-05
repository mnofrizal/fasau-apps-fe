"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { InventoryAPI } from "@/lib/api/inventory";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LogOut,
  Plus,
  X,
  Package,
  AlertCircle,
  FileText,
  List,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { materialUnits } from "@/contants/mockData";

export function TakeInventoryDialog({ onSuccess, inventory = [] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); // "detail" or "items"
  const [items, setItems] = useState([
    { name: "", category: "", quantity: 1, notes: "", unit: "pcs" },
  ]);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      type: "OUT",
      reference: "",
      notes: "",
      createdBy: "",
      to: "",
    },
    mode: "onChange", // Enable validation on change
  });

  // Watch form values for real-time validation
  const formValues = form.watch();
  const isDetailFormValid =
    formValues.reference?.trim() !== "" &&
    formValues.createdBy?.trim() !== "" &&
    formValues.to?.trim() !== "";

  useEffect(() => {
    // Fix for form watches not updating properly
    const subscription = form.watch(() => {
      // This forces a re-render when form values change
      // which ensures validation state is up to date
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Filter only items with quantity > 0 and organize by name
  const availableItems = useMemo(() => {
    const itemMap = {};

    inventory.forEach((item) => {
      if (!itemMap[item.name]) {
        itemMap[item.name] = {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          location: item.location,
          unit: item.unit || "pcs",
        };
      } else {
        itemMap[item.name].quantity += item.quantity;
      }
    });

    return Object.values(itemMap)
      .filter((item) => item.quantity > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory]);

  // Sidebar items for navigation
  const sidebarItems = [
    {
      id: "detail",
      icon: FileText,
      label: "Detail Transaksi",
    },
    {
      id: "items",
      icon: List,
      label: "Daftar Barang",
    },
  ];

  useEffect(() => {
    if (open) {
      // Reset to first tab when dialog opens
      setActiveTab("detail");
    }
  }, [open]);

  const addItem = () => {
    setItems([
      ...items,
      { name: "", category: "", quantity: 1, notes: "", unit: "pcs" },
    ]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    if (field === "name") {
      // When name is selected, also set the category and unit
      const selectedItem = availableItems.find((item) => item.name === value);
      updatedItems[index] = {
        ...updatedItems[index],
        name: value,
        category: selectedItem ? selectedItem.category : "",
        unit: selectedItem ? selectedItem.unit : "pcs",
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setItems(updatedItems);
  };

  const handleSubmit = async (formData) => {
    // Validate items
    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Mohon tambahkan minimal satu barang",
        variant: "destructive",
      });
      return;
    }

    // Check if quantities are valid
    const inventoryMap = {};
    inventory.forEach((item) => {
      if (!inventoryMap[item.name]) {
        inventoryMap[item.name] = item.quantity;
      } else {
        inventoryMap[item.name] += item.quantity;
      }
    });

    const invalidItems = validItems.filter((item) => {
      const availableQty = inventoryMap[item.name] || 0;
      return item.quantity > availableQty;
    });

    if (invalidItems.length > 0) {
      toast({
        title: "Jumlah Tidak Mencukupi",
        description: `Jumlah ${invalidItems
          .map((i) => i.name)
          .join(", ")} tidak mencukupi`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        ...formData,
        items: validItems,
      };

      const response = await InventoryAPI.recordMovement(data);

      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Barang berhasil dikeluarkan dari inventaris",
        });
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description:
            response.message || "Gagal mengeluarkan barang dari inventaris",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset({
      type: "OUT",
      reference: "",
      notes: "",
      createdBy: "",
      to: "",
    });
    setItems([{ name: "", category: "", quantity: 1, notes: "", unit: "pcs" }]);
    setActiveTab("detail");
  };

  // Get available quantity for a specific item
  const getAvailableQuantity = (itemName) => {
    if (!itemName) return 0;
    const item = availableItems.find((i) => i.name === itemName);
    return item ? item.quantity : 0;
  };

  // Get location for a specific item
  const getItemLocation = (itemName) => {
    if (!itemName) return "";
    const item = availableItems.find((i) => i.name === itemName);
    return item ? item.location : "";
  };

  // Get category for a specific item
  const getItemCategory = (itemName) => {
    if (!itemName) return "";
    const item = availableItems.find((i) => i.name === itemName);
    return item ? item.category : "";
  };

  // Get unit for a specific item
  const getItemUnit = (itemName) => {
    if (!itemName) return "pcs";
    const item = availableItems.find((i) => i.name === itemName);
    return item ? item.unit : "pcs";
  };

  // Handle next button click with validation
  const handleNextStep = () => {
    if (!isDetailFormValid) {
      toast({
        title: "Validasi Gagal",
        description: "Semua bidang wajib harus diisi",
        variant: "destructive",
      });
      // Trigger form validation to show errors
      form.trigger(["reference", "createdBy", "to"]);
      return;
    }
    setActiveTab("items");
  };

  // Handle tab change with validation
  const handleTabChange = (tabId) => {
    // If trying to go to items tab but form not valid
    if (tabId === "items" && !isDetailFormValid) {
      toast({
        title: "Validasi Gagal",
        description: "Semua bidang wajib harus diisi",
        variant: "destructive",
      });
      form.trigger(["reference", "createdBy", "to"]);
      return;
    }

    // Otherwise allow tab change
    setActiveTab(tabId);
  };

  const renderContent = () => {
    if (activeTab === "detail") {
      return (
        <div className="space-y-6">
          <div className="mb-2">
            <h3 className="mb-4 text-xl font-semibold tracking-tight">
              Detail Transaksi
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Masukkan informasi tentang transaksi barang keluar
            </p>
          </div>

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Nomor Referensi <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: OUT/2024/001"
                    {...field}
                    className="h-10"
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("reference");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Penanggung Jawab <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Masukkan nama anda"
                    {...field}
                    className="h-10"
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("createdBy");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Tujuan/Departemen <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Departemen IT"
                    {...field}
                    className="h-10"
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("to");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Catatan Tambahan
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan catatan tambahan jika ada"
                    className="min-h-[120px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="mb-2">
          <h3 className="mb-4 text-xl font-semibold tracking-tight">
            Daftar Barang
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Tambahkan barang yang akan diambil dari inventaris
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="h-9 px-3 transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Barang
            </Button>
          </div>
        </div>

        {availableItems.length === 0 && (
          <div className="mb-4 flex items-center rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <AlertCircle className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">Tidak ada barang tersedia</p>
              <p className="mt-1">
                Silakan tambahkan barang ke inventaris terlebih dahulu.
              </p>
            </div>
          </div>
        )}

        <ScrollArea className="-mr-4 h-[420px] pr-4">
          <div className="space-y-5">
            {items.map((item, index) => {
              const availableQty = getAvailableQuantity(item.name);
              const location = getItemLocation(item.name);
              const category = getItemCategory(item.name);
              const isInvalid = item.name && item.quantity > availableQty;

              return (
                <div
                  key={index}
                  className={`group rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md ${
                    isInvalid
                      ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20"
                      : ""
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-md bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/15">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base font-medium">
                        Barang {index + 1}
                      </span>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 p-0 text-destructive opacity-70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <label className="flex items-center text-sm font-semibold">
                        Nama Barang{" "}
                        <span className="ml-0.5 text-destructive">*</span>
                      </label>
                      <Select
                        value={item.name}
                        onValueChange={(value) =>
                          updateItem(index, "name", value)
                        }
                      >
                        <SelectTrigger className="h-10 transition-all focus:ring-1 focus:ring-primary/30">
                          <SelectValue placeholder="Pilih barang" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px]">
                          {availableItems.map((availableItem) => (
                            <SelectItem
                              key={availableItem.name}
                              value={availableItem.name}
                            >
                              {availableItem.name} ({availableItem.quantity}{" "}
                              {availableItem.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {item.name && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                          {location && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {location}
                            </Badge>
                          )}
                          {category && (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300"
                            >
                              {category}
                            </Badge>
                          )}
                          <span
                            className={
                              isInvalid
                                ? "ml-auto text-red-600 font-medium"
                                : "ml-auto text-emerald-600"
                            }
                          >
                            Tersedia: {availableQty} {item.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <label className="flex items-center text-sm font-semibold">
                          Jumlah{" "}
                          <span className="ml-0.5 text-destructive">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max={availableQty}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className={`h-10 transition-all focus:ring-1 focus:ring-primary/30 ${
                            isInvalid
                              ? "border-red-300 focus-visible:ring-red-500"
                              : ""
                          }`}
                          required
                        />
                        {isInvalid && (
                          <p className="text-xs font-medium text-red-600">
                            Jumlah melebihi stok
                          </p>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        <label className="flex items-center text-sm font-semibold">
                          Satuan{" "}
                          <span className="ml-0.5 text-destructive">*</span>
                        </label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            updateItem(index, "unit", value)
                          }
                        >
                          <SelectTrigger className="h-10 transition-all focus:ring-1 focus:ring-primary/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {materialUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2.5">
                      <label className="text-sm font-semibold">
                        Catatan Penggunaan
                      </label>
                      <Input
                        placeholder="Contoh: Untuk perbaikan perangkat"
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(index, "notes", e.target.value)
                        }
                        className="h-10 transition-all focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderFooter = () => {
    if (activeTab === "detail") {
      return (
        <div className="flex items-center justify-between gap-4 border-t pt-5">
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              1
            </div>
            <span>Detail Barang Keluar</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 border-gray-300 px-4"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!isDetailFormValid}
              className={`h-10 min-w-[100px] px-4 transition-colors ${
                !isDetailFormValid
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              Lanjut
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-4 border-t pt-5">
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            2
          </div>
          <span>Daftar Barang</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setActiveTab("detail")}
            className="h-10 border-gray-300 px-4"
          >
            Kembali
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || availableItems.length === 0}
            className="h-10 min-w-[130px] bg-orange-600 px-5 transition-all duration-200 hover:bg-orange-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Memproses...
              </div>
            ) : (
              "Ambil Barang"
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 bg-orange-600 transition-colors hover:bg-orange-700">
          <LogOut className="mr-2 h-4 w-4" />
          Barang Keluar
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[650px] max-w-[1000px] flex-row gap-0 border-gray-200 p-0 shadow-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Barang Keluar</DialogTitle>
        </DialogHeader>

        {/* Sidebar */}
        <div className="flex w-[220px] flex-col gap-1 border-r bg-muted/30 p-2">
          <div className="mb-2 border-b px-4 py-5">
            <h2 className="text-lg font-semibold tracking-tight">
              Barang Keluar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Catat transaksi keluar barang
            </p>
          </div>
          {sidebarItems.map((item, idx) => {
            const Icon = item.icon;
            // Check if tab should be disabled
            const isDisabled =
              isSubmitting || (item.id === "items" && !isDetailFormValid);

            return (
              <button
                key={item.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors 
                  ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : isDisabled
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-accent/50"
                  }
                  ${isDisabled && "opacity-50"}
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex h-full flex-col"
            >
              {/* Main Content */}
              <div className="flex-1">{renderContent()}</div>

              {/* Footer with Step-based Buttons */}
              {renderFooter()}
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
