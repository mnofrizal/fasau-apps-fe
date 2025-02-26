"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  CalendarIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function RecentTasksTable({ reports, onEdit, onDelete, onViewDetails }) {
  const [sorting, setSorting] = useState([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [pageIndex, setPageIndex] = useState(0);
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  const handleGlobalFilterChange = useCallback((e) => {
    setGlobalFilter(e.target.value);
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(Number(value));
    setPageIndex(0);
  }, []);

  const handleKategoriFilterChange = useCallback((value) => {
    setKategoriFilter(value);
  }, []);

  const handleSubCategoryFilterChange = useCallback((value) => {
    setSubCategoryFilter(value);
  }, []);

  const handleDateRangeChange = useCallback((value) => {
    setDateRange(value);
  }, []);

  const handleKategoriButtonClick = useCallback((value) => {
    setKategoriFilter((prev) => (prev === value ? "all" : value));
  }, []);

  const handleSubCategoryButtonClick = useCallback((value) => {
    setSubCategoryFilter((prev) => (prev === value ? "all" : value));
  }, []);

  const filteredData = useMemo(() => {
    return reports.filter((item) => {
      // Kategori filter
      if (kategoriFilter !== "all" && item.category !== kategoriFilter) {
        return false;
      }

      // SubCategory filter
      if (
        subCategoryFilter !== "all" &&
        item.subCategory !== subCategoryFilter
      ) {
        return false;
      }

      // Date range filter
      if (showTodayOnly) {
        const reportDate = new Date(item.createdAt);
        const today = new Date();
        if (
          reportDate.getDate() !== today.getDate() ||
          reportDate.getMonth() !== today.getMonth() ||
          reportDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (dateRange?.from && dateRange?.to) {
        const reportDate = new Date(item.createdAt);
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        if (reportDate < from || reportDate > to) {
          return false;
        }
      }

      return true;
    });
  }, [reports, kategoriFilter, subCategoryFilter, dateRange]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pageIndex, pageSize]);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = (pageIndex + 1) * pageSize < filteredData.length;

  const handlePreviousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    if ((pageIndex + 1) * pageSize < filteredData.length) {
      setPageIndex((prev) => prev + 1);
    }
  }, [pageIndex, pageSize, filteredData.length]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "No",
        size: 40,
      },
      {
        accessorKey: "evidence",
        header: "Eviden",
        size: 100,
        cell: ({ row }) => {
          const isPDF = row.original.evidence.toLowerCase().endsWith(".pdf");

          if (isPDF) {
            return (
              <div className="flex items-center">
                <Button
                  variant="link"
                  className="h-auto p-0 font-normal"
                  onClick={() => window.open(row.original.evidence, "_blank")}
                >
                  View PDF
                </Button>
              </div>
            );
          }

          return row.original.evidence ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={row.original.evidence}
                alt={`Evidence for ${row.original.description}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="64px"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.original.evidence, "_blank");
                }}
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-200 text-gray-600">
              No Image
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Uraian",
        size: 400,
        cell: ({ row }) => {
          const fullText = row.original.description;
          const truncatedText =
            fullText.length > 80 ? `${fullText.slice(0, 80)}...` : fullText;
          return (
            <div className="space-y-1">
              <div className="text-base" title={fullText}>
                {truncatedText}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "pelapor",
        header: "Pelapor",
        size: 150,
        cell: ({ row }) => {
          return (
            <div className="space-y-1">
              <div className="font-medium">{row.original.pelapor}</div>
              <div className="text-xs text-muted-foreground">
                {row.original.phone}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Waktu Lapor",
        size: 150,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="space-y-0.5">
              <div>{format(date, "dd MMM yyyy")}</div>
              <div className="text-xs text-muted-foreground">
                {format(date, "HH:mm")}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Kategori",
        size: 20,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <Badge
                variant="outline"
                className={`p-1 px-4 rounded-full ${
                  row.original.category === "CM"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-purple-500 bg-purple-50 text-purple-700"
                }`}
              >
                {row.original.category}
              </Badge>
              <Badge
                variant="outline"
                className={`p-1 px-4 rounded-full ${
                  row.original.subCategory === "TEMUAN"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                    : "border-blue-500 bg-blue-50 text-blue-700"
                }`}
              >
                {row.original.subCategory}
              </Badge>
            </div>
          );
        },
      },

      {
        accessorKey: "status",
        header: "STATUS",
        size: 20,
        cell: ({ row }) => {
          return (
            <Badge variant="outline" className={`p-2 px-6`}>
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        size: 20,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(row.original)}
                >
                  Delete Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete, onViewDetails]
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={globalFilter ?? ""}
              onChange={handleGlobalFilterChange}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleKategoriButtonClick("PM")}
              className={`rounded-full px-4 shadow-none ${
                kategoriFilter === "PM"
                  ? "bg-purple-50 text-purple-600 border-purple-600 hover:bg-purple-100 hover:text-purple-600 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:hover:text-white"
                  : "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-600 dark:hover:text-white"
              }`}
            >
              PM{" "}
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                {reports.filter((report) => report.category === "PM").length}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleKategoriButtonClick("CM")}
              className={`rounded-full px-4 shadow-none ${
                kategoriFilter === "CM"
                  ? "bg-green-50 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700 dark:hover:text-white"
                  : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-600 dark:hover:text-white"
              }`}
            >
              CM{" "}
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                {reports.filter((report) => report.category === "CM").length}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubCategoryButtonClick("TEMUAN")}
              className={`rounded-full px-4 shadow-none ${
                subCategoryFilter === "TEMUAN"
                  ? "bg-yellow-50 text-yellow-600 border-yellow-600 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700 dark:hover:text-white"
                  : "hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-600 dark:hover:text-white"
              }`}
            >
              Temuan{" "}
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {
                  reports.filter((report) => report.subCategory === "TEMUAN")
                    .length
                }
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowTodayOnly(!showTodayOnly);
                setDateRange({ from: null, to: null }); // Reset date range when toggling today filter
              }}
              className={`rounded-full px-4 shadow-none ${
                showTodayOnly
                  ? "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:hover:text-white"
                  : "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-600 dark:hover:text-white"
              }`}
            >
              Today{" "}
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {
                  reports.filter((report) => {
                    const reportDate = new Date(report.createdAt);
                    const today = new Date();
                    return (
                      reportDate.getDate() === today.getDate() &&
                      reportDate.getMonth() === today.getMonth() &&
                      reportDate.getFullYear() === today.getFullYear()
                    );
                  }).length
                }
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={kategoriFilter}
            onValueChange={handleKategoriFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
              <SelectItem value="CM">CM</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={subCategoryFilter}
            onValueChange={handleSubCategoryFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Sub Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="TEMUAN">TEMUAN</SelectItem>
              <SelectItem value="LAPORAN">LAPORAN</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[300px] justify-start text-left font-normal ${
                  !dateRange?.from && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    <>
                      {format(dateRange?.from, "LLL dd, y")} -{" "}
                      {format(dateRange?.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange?.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Card>
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-4 font-semibold uppercase text-gray-700 dark:text-gray-300"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center space-x-2 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="w-4">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onEdit(row.original)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="mx-2 h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} reports
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={!canPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!canNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
