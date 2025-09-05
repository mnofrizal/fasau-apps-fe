import ExcelJS from "exceljs";
import { InventoryAPI } from "@/lib/api/inventory";

export const exportToExcel = async (data, filename, type = "laporan") => {
  const workbook = new ExcelJS.Workbook();

  if (type === "temuan") {
    // First sheet - Temuan reports
    const mainSheet = workbook.addWorksheet("Temuan");
    if (data.mainData.length > 0) {
      mainSheet.columns = Object.keys(data.mainData[0]).map((key) => ({
        header: key,
        key: key,
        width: 15,
      }));
      mainSheet.addRows(data.mainData);
    }

    // Second sheet - Materials summary
    const materialsSheet = workbook.addWorksheet("Materials");
    if (data.materialsData.length > 0) {
      materialsSheet.columns = Object.keys(data.materialsData[0]).map(
        (key) => ({
          header: key,
          key: key,
          width: 15,
        })
      );
      materialsSheet.addRows(data.materialsData);
    }
  } else {
    // Single sheet for laporan
    const sheet = workbook.addWorksheet("Laporan");
    if (data.length > 0) {
      sheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 15,
      }));
      sheet.addRows(data);
    }
  }

  // Apply styling to all sheets
  workbook.worksheets.forEach((sheet) => {
    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add borders to all cells
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Auto-fit columns based on content
    sheet.columns.forEach((column) => {
      const maxLength = sheet
        .getColumn(column.number)
        .values.filter((value) => value !== null)
        .reduce((max, value) => Math.max(max, String(value).length), 0);
      column.width = Math.min(Math.max(maxLength, 10), 30);
    });
  });

  // Format current date and time
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Create filename with timestamp
  const timestamp = `${day}${month}${year}-${hours}${minutes}${seconds}`;
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Save the workbook
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = finalFilename;
    a.click();
    window.URL.revokeObjectURL(url);
  });
};

export const exportToJSON = async (data, filename, type = "laporan") => {
  // Format current date and time
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Create filename with timestamp
  const timestamp = `${day}${month}${year}-${hours}${minutes}${seconds}`;
  const finalFilename = `${filename}-${timestamp}.json`;

  // Prepare JSON data
  let jsonData;
  if (type === "temuan" && data.mainData && data.materialsData) {
    jsonData = {
      temuan: data.mainData,
      materials: data.materialsData,
    };
  } else {
    jsonData = data;
  }

  // Create blob and download
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  a.click();
  window.URL.revokeObjectURL(url);
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
      "Date Created": report.createdAt,
      "Evidence URL": report.evidence,
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
