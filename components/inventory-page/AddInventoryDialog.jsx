"use client";

import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  X,
  Package,
  Search,
  FileText,
  List,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { materialUnits } from "@/contants/mockData";

export function AddInventoryDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); // "detail" or "items"
  const [items, setItems] = useState([
    {
      name: "",
      category: "",
      quantity: 1,
      location: "",
      notes: "",
      unit: "pcs",
    },
  ]);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const inputRefs = useRef([]);
  const searchResultsRefs = useRef([]);
  const searchDebounceRef = useRef(null);

  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      type: "IN",
      reference: "",
      notes: "",
      createdBy: "",
    },
    mode: "onChange", // Enable validation on change for instant feedback
  });

  // Watch form values for real-time validation
  const formValues = form.watch();
  const isDetailFormValid =
    formValues.reference?.trim() !== "" && formValues.createdBy?.trim() !== "";

  useEffect(() => {
    // Fix for form watches not updating properly
    const subscription = form.watch(() => {
      // This forces a re-render when form values change
      // which ensures validation state is up to date
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
      fetchInventoryItems();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = items.every((_, index) => {
        const inputRef = inputRefs.current[index];
        const resultsRef = searchResultsRefs.current[index];

        return (
          (!inputRef || !inputRef.contains(event.target)) &&
          (!resultsRef || !resultsRef.contains(event.target))
        );
      });

      if (clickedOutside) {
        setActiveItemIndex(null);
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [items.length]);

  useEffect(() => {
    if (searchTerm) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setIsSearching(true);
        const results = inventoryItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, inventoryItems]);

  const fetchInventoryItems = async () => {
    try {
      setIsSearching(true);
      const response = await InventoryAPI.getAllItems();
      if (response && response.success && response.data) {
        setInventoryItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemNameChange = (index, value) => {
    setActiveItemIndex(index);
    setSearchTerm(value);
    updateItem(index, "name", value);
    if (value) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelectItem = (index, item) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      category: item.category || "",
      unit: item.unit || "pcs",
      location: item.location || updatedItems[index].location,
      inventoryId: item.id,
    };
    setItems(updatedItems);

    setShowResults(false);
    setSearchTerm("");
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        category: "",
        quantity: 1,
        location: "",
        notes: "",
        unit: "pcs",
      },
    ]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleSubmit = async (formData) => {
    const validItems = items.filter(
      (item) => item.name.trim() !== "" && item.category.trim() !== ""
    );
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description:
          "Mohon tambahkan minimal satu barang dengan nama dan kategori",
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
          description: "Barang telah berhasil ditambahkan ke inventaris",
        });
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description:
            response.message || "Gagal menambahkan barang ke inventaris",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan barang",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset({
      type: "IN",
      reference: "",
      notes: "",
      createdBy: "",
    });
    setItems([
      {
        name: "",
        category: "",
        quantity: 1,
        location: "",
        notes: "",
        unit: "pcs",
      },
    ]);
    setActiveTab("detail");
  };

  // Handle next button click with validation
  const handleNextStep = () => {
    if (!isDetailFormValid) {
      toast({
        title: "Validasi Gagal",
        description: "Nomor Referensi dan Penanggung Jawab harus diisi",
        variant: "destructive",
      });
      // Trigger form validation to show errors
      form.trigger(["reference", "createdBy"]);
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
        description: "Nomor Referensi dan Penanggung Jawab harus diisi",
        variant: "destructive",
      });
      form.trigger(["reference", "createdBy"]);
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
              Masukkan informasi tentang transaksi barang masuk ini
            </p>
          </div>
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Nomor Referensi/PO <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: PO/2024/001"
                    {...field}
                    className="h-10"
                    required
                    onChange={(e) => {
                      field.onChange(e);
                      // Force re-render to update validation state
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
                      // Force re-render to update validation state
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
              Tambahkan barang yang masuk ke inventaris
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

        <ScrollArea className="-mr-4 h-[420px] pr-4">
          <div className="space-y-5">
            {items.map((item, index) => (
              <div
                key={index}
                className="group rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md"
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
                    <div className="relative">
                      <Input
                        ref={(el) => (inputRefs.current[index] = el)}
                        placeholder="Contoh: Kursi, Meja, dll"
                        value={item.name}
                        onChange={(e) =>
                          handleItemNameChange(index, e.target.value)
                        }
                        onFocus={() => {
                          setActiveItemIndex(index);
                          if (item.name && inventoryItems.length > 0) {
                            setSearchTerm(item.name);
                            setShowResults(true);
                          }
                        }}
                        className="h-10 pr-9 transition-all focus:ring-1 focus:ring-primary/30"
                        required
                      />
                      <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-70" />

                      {showResults && activeItemIndex === index && (
                        <div
                          ref={(el) => (searchResultsRefs.current[index] = el)}
                          className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
                        >
                          <div className="max-h-[220px] overflow-auto">
                            {isSearching ? (
                              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                  Memuat...
                                </div>
                              </div>
                            ) : (
                              searchResults.length !== 0 && (
                                <div className="py-1">
                                  <div className="border-b px-3 py-2 text-xs font-semibold text-muted-foreground">
                                    Barang Tersedia
                                  </div>
                                  {searchResults.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex cursor-pointer flex-col gap-0.5 px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                      onClick={() =>
                                        handleSelectItem(index, item)
                                      }
                                    >
                                      <div className="text-sm font-medium">
                                        {item.name}
                                      </div>
                                      <div className="mt-0.5 text-xs text-muted-foreground">
                                        <span className="mr-1.5 rounded-sm bg-primary/10 px-1.5 py-0.5 text-primary-foreground/90">
                                          {item.category}
                                        </span>
                                        {item.quantity > 0 ? (
                                          <span className="text-emerald-600">{`${
                                            item.quantity
                                          } ${
                                            item.unit || "pcs"
                                          } tersedia`}</span>
                                        ) : (
                                          <span className="font-medium text-amber-600">
                                            (Stok habis)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="flex items-center text-sm font-semibold">
                      Kategori{" "}
                      <span className="ml-0.5 text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: KURSI, MEJA, dll"
                      value={item.category}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "category",
                          e.target.value.toUpperCase()
                        )
                      }
                      className="h-10 transition-all focus:ring-1 focus:ring-primary/30"
                      required
                    />
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
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-10 transition-all focus:ring-1 focus:ring-primary/30"
                        required
                      />
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
                        <SelectTrigger className="h-10">
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
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold">
                      Lokasi Penyimpanan
                    </label>
                    <Input
                      placeholder="Contoh: Gudang A, Rak B"
                      value={item.location}
                      onChange={(e) =>
                        updateItem(index, "location", e.target.value)
                      }
                      className="h-10 transition-all focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            ))}
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
            <span>Detail Barang Masuk</span>
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
                  : "bg-green-600 hover:bg-green-700"
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
            disabled={isSubmitting}
            className="h-10 min-w-[130px] bg-green-600 px-5 transition-all duration-200 hover:bg-green-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Menyimpan...
              </div>
            ) : (
              "Simpan Barang"
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 bg-green-600 transition-colors hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Barang Masuk
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[650px] max-w-[1000px] flex-row gap-0 border-gray-200 p-0 shadow-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Tambah Barang Masuk</DialogTitle>
        </DialogHeader>

        {/* Sidebar */}
        <div className="flex w-[220px] flex-col gap-1 border-r bg-muted/30 p-2">
          <div className="mb-2 border-b px-4 py-5">
            <h2 className="text-lg font-semibold tracking-tight">
              Barang Masuk
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Catat transaksi barang masuk
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
