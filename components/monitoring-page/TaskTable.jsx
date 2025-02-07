"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useAnimationControls } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function TaskTable({
  data,
  autoScroll = true,
  onToggleScroll,
  showInProgressOnly = false,
}) {
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filter for in-progress tasks if enabled
    if (showInProgressOnly) {
      filtered = filtered.filter((task) => task.status === "INPROGRESS");
    }

    // Sort by category
    filtered.sort((a, b) => a.category.localeCompare(b.category));

    return filtered;
  }, [data, showInProgressOnly]);

  const extendedData = useMemo(
    () => [...filteredData, ...filteredData, ...filteredData],
    [filteredData]
  );

  const columns = useMemo(
    () => [
      {
        header: "No.",
        accessorKey: "id",
        minSize: 80,
        maxSize: 80,
        cell: (info) => {
          const dataLength = filteredData.length;
          const rowIndex = info.row.index;
          const adjustedIndex = autoScroll
            ? (rowIndex % dataLength) + 1
            : rowIndex + 1;
          return (
            <div className="text-center text-xl font-medium text-gray-600 dark:text-gray-300">
              {adjustedIndex}
            </div>
          );
        },
      },
      {
        header: "Kategori",
        accessorKey: "category",
        minSize: 120,
        maxSize: 120,
        cell: (info) => (
          <div className="truncate text-2xl text-gray-600 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Nama Pekerjaan",
        accessorKey: "title",
        minSize: 280,
        maxSize: 280,
        cell: (info) => (
          <div className="break-words text-2xl font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Start Date",
        accessorKey: "createdAt",
        minSize: 150,
        maxSize: 150,
        cell: (info) => {
          const date = new Date(info.getValue());
          const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return (
            <div className="whitespace-nowrap text-2xl text-gray-600 dark:text-gray-300">
              {formattedDate}
            </div>
          );
        },
      },

      {
        header: "Status",
        accessorKey: "status",
        minSize: 150,
        maxSize: 150,
        cell: (info) => {
          const status = info.getValue();
          return (
            <div
              className={`w-full inline-flex justify-center items-center px-4 py-1.5 rounded-full text-sm font-medium text-white
              ${
                status === "COMPLETED"
                  ? "bg-green-600"
                  : status === "INPROGRESS"
                  ? "bg-blue-600"
                  : status === "CANCEL"
                  ? "bg-red-600"
                  : "bg-yellow-600"
              }`}
            >
              {status}
            </div>
          );
        },
      },
      {
        header: "Keterangan",
        accessorKey: "keterangan",
        minSize: 300,
        maxSize: 300,
        cell: (info) => (
          <div className="break-words text-xl text-gray-600 dark:text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
    ],
    [autoScroll, filteredData]
  );

  const tableData = useMemo(() => {
    return autoScroll ? extendedData : filteredData;
  }, [autoScroll, filteredData, extendedData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimationControls();
  const containerRef = useRef(null);

  useEffect(() => {
    const startAnimation = async () => {
      if (!autoScroll) {
        await controls.start({
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeInOut",
          },
        });
        return;
      }

      if (isHovered) {
        controls.stop();
        return;
      }

      const scrollDistance = filteredData.length * 57;

      await controls.start({
        y: [0, -scrollDistance],
        transition: {
          duration: 100,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0,
        },
      });
    };

    startAnimation();
  }, [controls, isHovered, autoScroll, filteredData.length]);

  return (
    <div>
      <div className="border border-gray-200 dark:border-gray-600">
        <ScrollArea
          className="h-[610px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative" ref={containerRef}>
            <div className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
              <table className="w-full table-fixed">
                <thead className="">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          style={{
                            width: `${header.column.columnDef.minSize}px`,
                          }}
                          className="px-4 py-4 text-left text-base font-semibold text-gray-900 dark:text-white"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
              </table>
            </div>
            <div className="relative">
              <motion.div
                animate={controls}
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <table className="w-full table-fixed">
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-200 dark:border-gray-600 
                          ${
                            row.original.category === "MEMO"
                              ? "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/30"
                              : row.original.category === "TASK"
                              ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:hover:bg-blue-900/30"
                              : row.original.category === "LAPORAN"
                              ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/30"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              width: `${cell.column.columnDef.minSize}px`,
                            }}
                            className="px-4 py-6"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
