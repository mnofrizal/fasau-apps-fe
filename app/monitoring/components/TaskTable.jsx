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
  // Double the data for seamless looping
  const extendedData = useMemo(() => [...data, ...data], [data]);

  const columns = useMemo(
    () => [
      {
        header: "No.",
        accessorKey: "id",
        cell: (info) => (
          <div className="text-center text-xl font-medium text-gray-300">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Task Name",
        accessorKey: "name",
        cell: (info) => (
          <div className="text-xl font-medium text-white">
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        cell: (info) => (
          <div className="text-xl text-gray-300">{info.getValue()}</div>
        ),
      },
      {
        header: "Kategori",
        accessorKey: "kategori",
        cell: (info) => (
          <div className="text-xl text-gray-300">{info.getValue()}</div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
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
        cell: (info) => (
          <div className="text-lg text-gray-300">{info.getValue()}</div>
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

      // Start infinite scrolling
      await controls.start({
        y: "-50%",
        transition: {
          duration: 30,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    startAnimation();
  }, [controls, isHovered, autoScroll]);

  return (
    <div className="rounded-xl border border-gray-600">
      <ScrollArea
        className="h-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden">
          <table className="w-full">
            <thead className="sticky top-0 z-50 bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-600">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
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
          <motion.div animate={controls}>
            <table className="w-full">
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-600 hover:bg-gray-700"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
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
      </ScrollArea>
    </div>
  );
}
