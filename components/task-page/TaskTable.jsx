"use client";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { TasksAPI } from "@/lib/api/tasks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  format,
  isWithinInterval,
  parse,
  endOfDay,
  startOfDay,
} from "date-fns";
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
  CalendarIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
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
import { DateRange } from "react-day-picker";
import { EditTaskDialog } from "./EditTaskDialog";

export function TaskTable({ tasks, onEditTask, onDeleteTask }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [pageIndex, setPageIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState(undefined);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return tasks.filter((task) => {
      // Hide completed filter
      if (hideCompleted && task.status === "COMPLETED") {
        return false;
      }

      // Status filter
      if (
        statusFilter &&
        statusFilter !== "all" &&
        task.status !== statusFilter
      ) {
        return false;
      }

      // Category filter
      if (
        categoryFilter &&
        categoryFilter !== "all" &&
        task.kategori !== categoryFilter
      ) {
        return false;
      }

      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        const taskDate = parse(task.startDate, "d MMM yyyy", new Date());
        if (
          !isWithinInterval(taskDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          })
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, categoryFilter, dateRange, hideCompleted]);

  const columns = [
    {
      accessorKey: "id",
      header: "No",
      size: 40,
    },
    {
      accessorKey: "title",
      header: "Uraian",
      size: 300,
    },
    {
      accessorKey: "createdAt",
      header: "Start",
      size: 100,
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "d MMM yyyy");
      },
    },
    {
      accessorKey: "category",
      header: "Kategori",
      size: 120,
      cell: ({ row }) => {
        const kategori = row.original.category;
        const colorMap = {
          MEMO: "blue",
          TASK: "yellow",
          LAPORAN: "purple",
        };
        const color = colorMap[kategori] || "gray";
        return (
          <Badge
            variant="outline"
            className={`bg-${color}-500/10 text-${color}-500 font-medium px-2.5 py-0.5 rounded-md transition-colors hover:bg-${color}-500/20`}
          >
            {kategori}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap = {
          COMPLETED: "green",
          INPROGRESS: "blue",
          CANCEL: "red",
        };
        const color = colorMap[status] || "gray";
        return (
          <div
            variant="outline"
            className={` text-center bg-${color}-500/10 text-${color}-500 font-medium px-2.5 py-1.5 rounded-md transition-colors hover:bg-${color}-500/20`}
          >
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      size: 200,
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(row.original);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTaskId(row.original.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-completed"
              checked={hideCompleted}
              onCheckedChange={setHideCompleted}
            />
            <Label htmlFor="hide-completed">Hide completed</Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="CANCEL">Cancel</SelectItem>
              <SelectItem value="INPROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="memo">Memo</SelectItem>
              <SelectItem value="laporan">Laporan</SelectItem>
              <SelectItem value="task">Tugas</SelectItem>
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
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border shadow-md">
        <div className="overflow-auto">
          <Table className="relative w-full">
            <TableHeader className="sticky top-0 z-10 bg-gray-100">
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
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-gray-50/50"
                    onClick={() => {
                      setSelectedTask(row.original);
                      setEditDialogOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 font-normal"
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows?.length ?? 0} of{" "}
            {filteredData.length} tasks
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
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
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 rounded-md p-0"
            >
              <ChevronUp className="rotate-270 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 rounded-md p-0"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </div>

        <AlertDialog open={deleteTaskId !== null}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                task and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTaskId(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    setIsDeleting(true);
                    await TasksAPI.deleteTask(deleteTaskId);
                    toast({
                      title: "Task deleted successfully",
                      variant: "success",
                    });
                    onDeleteTask?.();
                  } catch (error) {
                    toast({
                      title: "Failed to delete task",
                      description: error.message,
                      variant: "destructive",
                    });
                  } finally {
                    setIsDeleting(false);
                    setDeleteTaskId(null);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <EditTaskDialog
          task={selectedTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEditTask={onEditTask}
        />
      </div>
    </div>
  );
}
