import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { InventoryAPI } from "@/lib/api/inventory";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNITS = [
  "pcs",
  "box",
  "kg",
  "meter",
  "roll",
  "liter",
  "pack",
  "set",
  "buah",
  "unit",
  "lembar",
  "pal",
  "galon",
  "biji",
  "kaleng",
];

export function AddMaterialDialog({ open, onOpenChange, onSave }) {
  const [materialForm, setMaterialForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    id: null,
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchDebounceRef = useRef(null);
  const inputRef = useRef(null);
  const searchResultsRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchInventoryItems();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      // Debounce search to avoid excessive API calls
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
        setShowResults(true);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
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

  const handleSelectItem = (item) => {
    setMaterialForm({
      name: item.name,
      category: item.category || "",
      quantity: "",
      unit: item.unit || "",
      id: item.id, // Store the inventory item ID for reference
    });
    setShowResults(false);
  };

  const handleSave = () => {
    if (materialForm.name) {
      onSave(materialForm);
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setMaterialForm({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      id: null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Material</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="name"
                value={materialForm.name}
                onChange={(e) => {
                  setMaterialForm({
                    ...materialForm,
                    name: e.target.value,
                    id: null, // Reset inventory ID when typing manually
                  });
                  setSearchTerm(e.target.value);
                }}
                onFocus={() => {
                  if (materialForm.name && inventoryItems.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="w-full"
                placeholder="Search or enter material name..."
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />

              {/* Custom dropdown that stays under the input */}
              {showResults && (
                <div
                  ref={searchResultsRef}
                  className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                >
                  <div className="max-h-[200px] overflow-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        Tambahkan {searchTerm} sebagai material
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
                            onClick={() => handleSelectItem(item)}
                          >
                            <div className="font-medium">{item.name}</div>
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
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Jumlah</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={materialForm.quantity}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      quantity: e.target.valueAsNumber,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Satuan</Label>
                <Select
                  value={materialForm.unit}
                  onValueChange={(value) =>
                    setMaterialForm({ ...materialForm, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={!materialForm.name}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
