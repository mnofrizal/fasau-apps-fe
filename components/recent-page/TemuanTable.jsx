"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Search,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

export function TemuanTable({ reports, onEdit, onDelete, onViewDetails }) {
  const [sorting, setSorting] = useState([{ id: "createdAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [pageIndex, setPageIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  const handleGlobalFilterChange = useCallback((e) => {
    setGlobalFilter(e.target.value);
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(Number(value));
    setPageIndex(0);
  }, []);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);

  const handleStatusButtonClick = useCallback((value) => {
    setStatusFilter((prev) => (prev === value ? "all" : value));
  }, []);

  const handleDateSelect = useCallback((range) => {
    setDateRange(range);
    setShowTodayOnly(false);
  }, []);

  const filteredData = useMemo(() => {
    const temuanReports = reports.filter(
      (report) => report.subCategory === "TEMUAN"
    );

    return temuanReports.filter((item) => {
      // Status filter
      if (statusFilter === "COMPLETED" && item.status !== "COMPLETED") {
        return false;
      }
      if (statusFilter === "INCOMPLETED" && item.status === "COMPLETED") {
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
  }, [reports, statusFilter, dateRange, showTodayOnly]);

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
        id: "rowNumber",
        header: "No",
        size: 40,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
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
        accessorKey: "category",
        header: "Kategori",
        size: 120,
        cell: ({ row }) => {
          return (
            <Badge
              variant="outline"
              className={
                row.original.category === "PM"
                  ? "border-blue-500 text-blue-500"
                  : "border-green-500 text-green-500"
              }
            >
              {row.original.category}
            </Badge>
          );
        },
      },
      {
        accessorKey: "material",
        header: "Material",
        size: 120,
        cell: ({ row }) => {
          return (
            <Badge variant="secondary">
              {row.original.material?.length || 0} items
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => {
          return (
            <Badge
              variant={
                row.original.status === "COMPLETED" ? "success" : "secondary"
              }
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
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
        id: "actions",
        size: 100,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
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
              onClick={() => handleStatusButtonClick("INCOMPLETED")}
              className={`rounded-full px-4 shadow-none ${
                statusFilter === "INCOMPLETED"
                  ? "bg-yellow-50 text-yellow-600 border-yellow-600 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-700 dark:hover:text-white"
                  : "hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-600 dark:hover:text-white"
              }`}
            >
              Incompleted{" "}
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {
                  reports
                    .filter((report) => report.subCategory === "TEMUAN")
                    .filter((report) => report.status !== "COMPLETED").length
                }
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusButtonClick("COMPLETED")}
              className={`rounded-full px-4 shadow-none ${
                statusFilter === "COMPLETED"
                  ? "bg-green-50 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700 dark:hover:text-white"
                  : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-600 dark:hover:text-white"
              }`}
            >
              Completed{" "}
              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                {
                  reports
                    .filter((report) => report.subCategory === "TEMUAN")
                    .filter((report) => report.status === "COMPLETED").length
                }
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="INCOMPLETED">Incompleted</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
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
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Card className="mt-6">
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
