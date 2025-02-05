"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useAnimationControls } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TaskTable({ data, autoScroll = true, onToggleScroll }) {
  // Triple the data for seamless looping with better content coverage
  const extendedData = useMemo(() => [...data, ...data, ...data], [data]);

  const columns = useMemo(
    () => [
      {
        header: "No.",
        accessorKey: "id",
        minSize: 80,
        maxSize: 80,
        cell: (info) => (
          <div className="text-center text-xl font-medium text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Task Name",
        accessorKey: "name",
        minSize: 250,
        maxSize: 250,
        cell: (info) => (
          <div className="truncate text-xl font-medium text-white">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        minSize: 150,
        maxSize: 150,
        cell: (info) => (
          <div className="whitespace-nowrap text-xl text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Kategori",
        accessorKey: "kategori",
        minSize: 150,
        maxSize: 150,
        cell: (info) => (
          <div className="truncate text-xl text-gray-300">
            {info.getValue()}
          </div>
        ),
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
              className={`w-full inline-flex justify-center items-center px-4 py-1.5 rounded-full text-sm font-medium
              ${
                status === "Completed"
                  ? "bg-green-600 text-white"
                  : status === "In Progress"
                  ? "bg-blue-600 text-white"
                  : "bg-yellow-600 text-white"
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
          <div className="truncate text-lg text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    return autoScroll ? extendedData : data;
  }, [autoScroll, data, extendedData]);

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
        // Reset position when auto-scroll is turned off
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
        // Pause at current position when hovered
        controls.stop();
        return;
      }

      // Calculate total scroll distance based on data length (57px is approximate row height)
      const scrollDistance = data.length * 57;

      // Start infinite scrolling with seamless loop
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
  }, [controls, isHovered, autoScroll, data.length]);

  return (
    <div className="border border-gray-600">
      <ScrollArea
        className="h-[570px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative" ref={containerRef}>
          <div className="sticky top-0 z-50 border-b border-gray-600 bg-gray-700">
            <table className="w-full table-fixed">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{
                          width: `${header.column.columnDef.minSize}px`,
                        }}
                        className="px-4 py-4 text-left text-base font-semibold text-white"
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
                      className="border-b border-gray-600 hover:bg-gray-700"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            width: `${cell.column.columnDef.minSize}px`,
                          }}
                          className="px-4 py-4"
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
  );
}
