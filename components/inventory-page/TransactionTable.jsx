"use client";

import { useState, useMemo, useCallback } from "react";
import { enGB, id } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
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
  Calendar as CalendarIcon,
  ArrowUpDown,
  ClipboardList,
  DownloadCloud,
  FileDown,
  Package,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { InventoryAPI } from "@/lib/api/inventory";
import { format, parseISO } from "date-fns";

export function TransactionTable({ transactions, isLoading, onSuccess }) {
  const [sorting, setSorting] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(undefined);

  const filteredData = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((transaction) => {
      // Type filter
      if (
        typeFilter &&
        typeFilter !== "all" &&
        transaction.type !== typeFilter
      ) {
        return false;
      }

      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        const txDate = new Date(transaction.createdAt);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);

        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        if (txDate < fromDate || txDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, dateRange]);

  const columns = [
    {
      id: "index",
      header: "No",
      size: 60,
      cell: (info) => pageIndex * pageSize + info.row.index + 1,
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex h-8 items-center gap-1 p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tipe
            <div className="ml-1 flex h-4 w-4 items-center justify-center">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
          </Button>
        );
      },
      size: 100,
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge
            className={`${
              type === "IN"
                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                : "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400"
            } px-3 py-1 font-medium`}
          >
            {type === "IN" ? (
              <>
                <ArrowDown className="mr-2 h-4 w-4" />
                MASUK
              </>
            ) : (
              <>
                <ArrowUp className="mr-2 h-4 w-4" />
                KELUAR
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "reference",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex h-8 items-center gap-1 p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Referensi/Memo
            <div className="ml-1 flex h-4 w-4 items-center justify-center">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
          </Button>
        );
      },
      size: 150,
      cell: ({ row }) => (
        <div className="text-xs font-medium">{row.original.reference}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex h-8 items-center gap-1 p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <div className="ml-1 flex h-4 w-4 items-center justify-center">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
          </Button>
        );
      },
      size: 150,
      cell: ({ row }) => {
        const date = parseISO(row.original.createdAt);
        return (
          <div className="flex flex-col text-xs">
            <span>{format(date, "d MMM yyyy", { locale: id })}</span>
            <span className="text-xs text-muted-foreground">
              {format(date, "HH:mm", { locale: id })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex h-8 items-center gap-1 p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Diinput
            <div className="ml-1 flex h-4 w-4 items-center justify-center">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
          </Button>
        );
      },
      size: 150,
      cell: ({ row }) => (
        <div className="text-xs">{row.original.createdBy}</div>
      ),
    },
    {
      accessorKey: "to",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="flex h-8 items-center gap-1 p-0 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tujuan
            <div className="ml-1 flex h-4 w-4 items-center justify-center">
              {column.getIsSorted() === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </div>
          </Button>
        );
      },
      size: 150,
      cell: ({ row }) => {
        if (row.original.type !== "OUT" || !row.original.to) {
          return <div className="text-xs text-muted-foreground">-</div>;
        }
        return <div className="text-xs">{row.original.to}</div>;
      },
    },
    {
      accessorKey: "items",
      header: "Barang",
      size: 100,
      cell: ({ row }) => {
        const itemCount = row.original.items?.length || 0;
        return (
          <div className="flex items-center">
            <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-3.5 w-3.5 text-primary" />
            </div>
            <span>
              {itemCount} {itemCount === 1 ? "barang" : "barang"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Catatan",
      size: 200,
      cell: ({ row }) => (
        <div className="line-clamp-2 max-w-[400px] text-xs text-muted-foreground">
          {row.original.notes || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      size: 100,
      cell: ({ row }) => {
        const handleDownloadPDF = async (e) => {
          e.stopPropagation();
          try {
            const blob = await InventoryAPI.downloadTransactionPDF(
              row.original.id
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `transaction-${row.original.reference}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } catch (error) {
            console.error("Error downloading PDF:", error);
          }
        };

        return (
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.type === "OUT" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadPDF}
                className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                title="Unduh Berita Acara"
              >
                <FileDown className="h-4 w-4 text-red-600" />
              </Button>
            )}
            <EditTransactionDialog
              transaction={row.original}
              onSuccess={isLoading ? undefined : onSuccess}
            />
          </div>
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
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(table.getState().pagination);
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="IN">MASUK</SelectItem>
              <SelectItem value="OUT">KELUAR</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[240px] justify-start text-left font-normal ${
                  !dateRange?.from ? "text-muted-foreground" : ""
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
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

          {(typeFilter || dateRange) && (
            <Button
              variant="ghost"
              onClick={() => {
                setTypeFilter("all");
                setDateRange(undefined);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedTransaction(row.original);
                    setDetailsOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
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
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <div className="flex items-center justify-between space-y-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} transactions
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue>{pageSize}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
    </div>
  );
}
