"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { InventoryAPI } from "@/lib/api/inventory";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Plus, X, Package, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { materialUnits } from "@/contants/mockData";

export function AddInventoryDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // New state for inventory search
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
  });

  useEffect(() => {
    if (open) {
      fetchInventoryItems();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close all dropdowns if click is outside any input or result container
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
      // Debounce search to avoid excessive filtering
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
    // Update the form values with selected item data
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      category: item.category || "",
      unit: item.unit || "pcs",
      // Also update location if it exists in the inventory item
      location: item.location || updatedItems[index].location,
      // Store the inventory ID for future reference
      inventoryId: item.id,
    };
    setItems(updatedItems);

    // Close the dropdown and reset search
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
    // Validate items
    const validItems = items.filter(
      (item) => item.name.trim() !== "" && item.category.trim() !== ""
    );
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item with name and category",
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
          title: "Success",
          description: "Items have been added to inventory",
        });
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add items to inventory",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding items",
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Barang Masuk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Barang Masuk</DialogTitle>
          <DialogDescription>
            Masukkan detail barang yang akan ditambahkan ke inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Referensi</FormLabel>
                    <FormControl>
                      <Input placeholder="PO/2024/001" {...field} />
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
                    <FormLabel>Dibuat Oleh</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="mb-2 flex justify-between">
                <h3 className="text-lg font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-1 h-4 w-4" /> Tambah Barang
                </Button>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Item {index + 1}</span>
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Nama Barang <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              ref={(el) => (inputRefs.current[index] = el)}
                              placeholder="Chair, Table, etc."
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
                              required
                            />
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />

                            {/* Custom dropdown for this specific item */}
                            {showResults && activeItemIndex === index && (
                              <div
                                ref={(el) =>
                                  (searchResultsRefs.current[index] = el)
                                }
                                className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                              >
                                <div className="max-h-[200px] overflow-auto">
                                  {isSearching ? (
                                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                      Loading...
                                    </div>
                                  ) : searchResults.length === 0 ? (
                                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                                      Tambahkan {searchTerm} ke inventory
                                    </div>
                                  ) : (
                                    <div className="py-1">
                                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                        Inventory Items
                                      </div>
                                      {searchResults.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex cursor-default flex-col items-start px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                          onClick={() =>
                                            handleSelectItem(index, item)
                                          }
                                        >
                                          <div className="font-medium">
                                            {item.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {item.category}{" "}
                                            {item.quantity > 0
                                              ? `(${item.quantity} ${
                                                  item.unit || "pcs"
                                                } available)`
                                              : "(Out of stock)"}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Kategori <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="CHAIR, TABLE, etc."
                            value={item.category}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "category",
                                e.target.value.toUpperCase()
                              )
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Qty <span className="text-red-500">*</span>
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
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Satuan <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={item.unit}
                              onValueChange={(value) =>
                                updateItem(index, "unit", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {materialUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Penyimpanan
                          </label>
                          <Input
                            placeholder="Storage Room A"
                            value={item.location}
                            onChange={(e) =>
                              updateItem(index, "location", e.target.value)
                            }
                          />
                        </div>
                        {/* <div className="col-span-2 space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <Input
                            placeholder="Item description"
                            value={item.notes}
                            onChange={(e) =>
                              updateItem(index, "notes", e.target.value)
                            }
                          />
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Menambahkan..." : "Tambah Barang"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
