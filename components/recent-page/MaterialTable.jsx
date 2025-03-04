import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { InventoryAPI } from "@/lib/api/inventory";

export function MaterialTable({ materials, onDelete }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      const response = await InventoryAPI.getAllItems();
      if (response && response.success && response.data) {
        setInventoryItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockForMaterial = (material) => {
    if (!inventoryItems.length) return "-";

    // Try to match by ID first if available
    if (material.inventoryId) {
      const matchedItem = inventoryItems.find(
        (item) => item.id === material.inventoryId
      );
      if (matchedItem) return matchedItem.quantity || 0;
    }

    // Fall back to matching by name
    const matchedItem = inventoryItems.find(
      (item) => item.name.toLowerCase() === material.name.toLowerCase()
    );

    return matchedItem ? matchedItem.quantity || 0 : "-";
  };
  if (!materials || materials.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
        No material added
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Material
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Qty
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Sat
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Stok
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Delete</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {materials.map((material, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-2 py-1 text-sm text-gray-900">
                {material.name}
              </td>
              <td className="whitespace-nowrap px-2 py-1 text-center text-sm text-gray-900">
                {material.quantity || "-"}
              </td>
              <td className="whitespace-nowrap px-2 py-1 text-center text-sm text-gray-900">
                {material.unit || "-"}
              </td>
              <td className="whitespace-nowrap px-2 py-1 text-center text-sm text-gray-900">
                {isLoading ? "Loading..." : getStockForMaterial(material)}
              </td>
              <td className="whitespace-nowrap px-2 py-1 text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(index)}
                >
                  <Trash size={1} className="h-2 w-2 text-red-700" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
