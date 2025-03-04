import * as XLSX from "xlsx";
import { InventoryAPI } from "@/lib/api/inventory";

export const exportToExcel = (data, filename, type = "laporan") => {
  const wb = XLSX.utils.book_new();

  if (type === "temuan") {
    // First sheet - Temuan reports
    const mainWs = XLSX.utils.json_to_sheet(data.mainData);
    XLSX.utils.book_append_sheet(wb, mainWs, "Temuan");

    // Second sheet - Materials summary
    const materialsWs = XLSX.utils.json_to_sheet(data.materialsData);
    XLSX.utils.book_append_sheet(wb, materialsWs, "Materials");
  } else {
    // Single sheet for laporan
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const prepareReportData = async (reports, type = "laporan") => {
  if (type === "laporan") {
    return reports.map((report) => ({
      ID: report.id,
      Description: report.description,
      Reporter: report.pelapor,
      Phone: report.phone,
      Category: report.category,
      "Sub Category": report.subCategory,
      Status: report.status,
      "Created At": new Date(report.createdAt).toLocaleString(),
    }));
  } else {
    const temuanData = [];
    reports
      .filter((report) => report.subCategory === "TEMUAN")
      .forEach((report) => {
        if (report.material && report.material.length > 0) {
          report.material.forEach((material) => {
            temuanData.push({
              Description: report.description,
              Reporter: report.pelapor,
              Phone: report.phone,
              Category: report.category,
              Status: report.status,
              "Material Name": material.name || "",
              "Material Quantity": material.quantity || 0,
              "Material Unit": material.unit || "",
              "Created At": new Date(report.createdAt).toLocaleString(),
            });
          });
        } else {
          temuanData.push({
            Description: report.description,
            Reporter: report.pelapor,
            Phone: report.phone,
            Category: report.category,
            Status: report.status,
            "Material Name": "-",
            "Material Quantity": 0,
            "Material Unit": "-",
            "Created At": new Date(report.createdAt).toLocaleString(),
          });
        }
      });

    if (type === "temuan") {
      // Fetch inventory items for stock information
      let inventoryItems = [];
      try {
        const response = await InventoryAPI.getAllItems();
        if (response && response.success && response.data) {
          inventoryItems = response.data;
        }
      } catch (error) {
        console.error("Error fetching inventory items for export:", error);
      }

      // Function to get stock for a material
      const getStockForMaterial = (material) => {
        if (!inventoryItems.length) return 0;

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

        return matchedItem ? matchedItem.quantity || 0 : 0;
      };

      // Prepare materials summary data
      const materialsMap = new Map();
      reports
        .filter((report) => report.subCategory === "TEMUAN")
        .forEach((report) => {
          if (report.material && report.material.length > 0) {
            report.material.forEach((material) => {
              const key = material.name;
              if (materialsMap.has(key)) {
                const existing = materialsMap.get(key);
                existing.qty += material.quantity || 0;
              } else {
                materialsMap.set(key, {
                  name: material.name,
                  qty: material.quantity || 0,
                  unit: material.unit,
                  description: report.description,
                  inventoryId: material.inventoryId || null,
                });
              }
            });
          }
        });

      const materialsData = Array.from(materialsMap.values()).map(
        (material, index) => ({
          No: index + 1,
          "Nama Material": material.name,
          Qty: material.qty,
          "Stok Gudang": getStockForMaterial(material),
          Satuan: material.unit,
          "Deskripsi Pekerjaan": material.description,
        })
      );

      return {
        mainData: temuanData,
        materialsData: materialsData,
      };
    }

    return temuanData;
  }
};
