"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import { recentTaskReports } from "@/contants/mockData";
import Image from "next/image";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
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

export default function RecentTasksPage() {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [pageIndex, setPageIndex] = useState(0);
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const filteredData = useMemo(() => {
    return recentTaskReports.filter((item) => {
      // Kategori filter
      if (kategoriFilter !== "all") {
        const itemKategori = item.id % 2 === 0 ? "PM" : "CM";
        if (itemKategori !== kategoriFilter) return false;
      }

      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        // This is a simplified date check. In a real app, you'd parse actual dates
        // For demo, we'll just pass all items when date range is selected
        // You would implement proper date comparison here
      }

      return true;
    });
  }, [recentTaskReports, kategoriFilter, dateRange]);

  const columns = [
    {
      accessorKey: "id",
      header: "No",
      size: 40,
    },
    {
      accessorKey: "image",
      header: "Eviden",
      size: 80,
      cell: ({ row }) => (
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <Image
            src={row.original.image}
            alt={`Evidence ${row.original.id}`}
            fill
            className="object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: "task",
      header: "Uraian",
      size: 200,
    },
    {
      accessorKey: "employee",
      header: "Pelapor",
      size: 150,
    },
    {
      accessorKey: "time",
      header: "Waktu Lapor",
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Kategori",
      size: 100,
      cell: ({ row }) => {
        // Randomly assign PM or CM for demonstration
        const kategori = row.original.id % 2 === 0 ? "PM" : "CM";
        return kategori;
      },
    },
    {
      id: "actions",
      size: 50,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => console.log("View", row.original)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("Edit", row.original)}
              >
                Edit Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <main className="flex-1 space-y-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Recent Tasks</h1>
        <p className="text-muted-foreground">
          View your latest task activities
        </p>
      </div>
      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
              <SelectItem value="CM">CM</SelectItem>
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
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Card>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-4 font-semibold"
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
                  <TableRow key={row.id}>
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
                <TableRow>
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
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
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
              Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
              tasks
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
