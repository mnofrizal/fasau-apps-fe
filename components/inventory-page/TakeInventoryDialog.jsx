"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Plus, X, Package, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { materialUnits } from "@/contants/mockData";

export function TakeInventoryDialog({ onSuccess, inventory = [] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    },
  });

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
        description: "Please add at least one item",
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
        title: "Insufficient Quantity",
        description: `Not enough ${invalidItems
          .map((i) => i.name)
          .join(", ")} in inventory`,
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
          description: "Items have been taken from inventory",
        });
        setOpen(false);
        resetForm();
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description:
            response.message || "Failed to take items from inventory",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing",
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
    });
    setItems([{ name: "", category: "", quantity: 1, notes: "", unit: "pcs" }]);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <LogOut className="mr-2 h-4 w-4" />
          Barang Keluar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Barang Keluar</DialogTitle>
          <DialogDescription>
            Masukkan detail barang yang akan diambil dari inventory.
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
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="OUT/IT/2024/001" {...field} />
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
                    <FormLabel>Created By</FormLabel>
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
                  <FormLabel>Notes</FormLabel>
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
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>

              {availableItems.length === 0 && (
                <div className="mb-4 flex items-center rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-800 dark:text-amber-300">
                    No items available in inventory. Please add items first.
                  </span>
                </div>
              )}

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const availableQty = getAvailableQuantity(item.name);
                    const location = getItemLocation(item.name);
                    const category = getItemCategory(item.name);
                    const isInvalid = item.name && item.quantity > availableQty;

                    return (
                      <div
                        key={index}
                        className={`rounded-md border p-4 ${
                          isInvalid
                            ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Item {index + 1}
                            </span>
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
                              Item Name <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={item.name}
                              onValueChange={(value) =>
                                updateItem(index, "name", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select an item" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableItems.map((availableItem) => (
                                  <SelectItem
                                    key={availableItem.name}
                                    value={availableItem.name}
                                  >
                                    {availableItem.name} (Available:{" "}
                                    {availableItem.quantity}{" "}
                                    {availableItem.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {item.name && (
                              <div className="mt-1 flex items-center justify-between text-xs">
                                <div className="flex gap-2">
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
                                </div>
                                <span
                                  className={
                                    isInvalid
                                      ? "text-red-600"
                                      : "text-muted-foreground"
                                  }
                                >
                                  Available: {availableQty} {item.unit}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Quantity <span className="text-red-500">*</span>
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
                                className={
                                  isInvalid
                                    ? "border-red-300 focus:ring-red-500"
                                    : ""
                                }
                                required
                              />
                              {isInvalid && (
                                <p className="text-xs text-red-600">
                                  Quantity exceeds available stock
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Unit <span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={item.unit}
                                onValueChange={(value) =>
                                  updateItem(index, "unit", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
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
                          <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <Input
                              placeholder="Purpose of taking this item"
                              value={item.notes}
                              onChange={(e) =>
                                updateItem(index, "notes", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || availableItems.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? "Processing..." : "Take Items"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
