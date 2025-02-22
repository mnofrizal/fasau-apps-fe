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
  CheckCircle,
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
  const [hideCompleted, setHideCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hideCompleted");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [showMemoOnly, setShowMemoOnly] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showMemoOnly");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [showTodayOnly, setShowTodayOnly] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showTodayOnly");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [showJasaOnly, setShowJasaOnly] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showJasaOnly");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [completeTaskId, setCompleteTaskId] = useState(null);
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return tasks.filter((task) => {
      // Hide completed filter
      if (hideCompleted && task.status === "COMPLETED") {
        return false;
      }
      if (showMemoOnly && task.category !== "MEMO") {
        return false;
      }
      if (showJasaOnly && task.category !== "JASA") {
        return false;
      }

      // Today only filter
      if (showTodayOnly) {
        const taskDate = new Date(task.createdAt);
        const today = new Date();
        if (
          taskDate.getDate() !== today.getDate() ||
          taskDate.getMonth() !== today.getMonth() ||
          taskDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
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
        task.category !== categoryFilter
      ) {
        return false;
      }

      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        const taskDate = new Date(task.createdAt);
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
  }, [
    tasks,
    statusFilter,
    categoryFilter,
    dateRange,
    hideCompleted,
    showMemoOnly,
    showTodayOnly,
    showJasaOnly,
  ]);

  const columns = [
    {
      id: "index",
      header: "No",
      size: 40,
      cell: (info) => (info.row.index % pageSize) + 1,
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
          JASA: "green",
          MATERIAL: "pink",
        };
        const color = colorMap[kategori] || "gray";
        return (
          <Badge
            variant="outline"
            className={`bg-${color}-500/10 text-xs text-${color}-500 font-medium px-2.5 py-1 rounded-md transition-colors hover:bg-${color}-500/20 dark:bg-${color}-700 dark:text-white`}
          >
            {kategori}
          </Badge>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Uraian",
      size: 300,
      cell: ({ row }) => (
        <div className="text-base text-gray-900 dark:text-gray-200">
          {row.original.title}
        </div>
      ),
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
      accessorKey: "status",
      header: () => <div className="w-full text-center">Status</div>,
      size: 120,
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap = {
          COMPLETED: "green",
          INPROGRESS: "blue",
          CANCEL: "red",
          BACKLOG: "yellow",
        };
        const color = colorMap[status] || "gray";
        return (
          <Badge
            variant="outline"
            className={`text-center text-xs w-full justify-center  ${
              color === "red" ? "bg-red-500/10" : `bg-${color}-500/10`
            } text-${color}-500 border-${color}-100  font-medium px-2.5 py-1.5 rounded-md transition-colors ${
              color === "red"
                ? "hover:bg-red-500/20 border-red-100"
                : `hover:bg-${color}-500/20`
            } dark:bg-${color}-700 dark:text-white`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      size: 200,
      cell: ({ row }) => (
        <div className="line-clamp-4 break-words text-base text-gray-900 dark:text-gray-200">
          {row.original.keterangan}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
      cell: ({ row }) => {
        return (
          <div className="flex items-end justify-end space-x-1">
            {row.original.status == "INPROGRESS" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setCompleteTaskId(row.original.id);
                }}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            )}
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
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col">
        <div className="shadow-mds sticky top-0 z-10 w-full">
          <div className="flex w-full flex-wrap items-center justify-between gap-4 bg-white p-4 px-0 dark:bg-gray-900">
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newValue = !hideCompleted;
                    setHideCompleted(newValue);
                    localStorage.setItem(
                      "hideCompleted",
                      JSON.stringify(newValue)
                    );
                  }}
                  className={`rounded-full px-4 shadow-none ${
                    hideCompleted
                      ? "bg-sky-50 text-teal-600 border-teal-600 hover:bg-teal-100 hover:text-teal-600 dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700 dark:hover:text-white"
                      : "hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-600 dark:hover:text-white"
                  }`}
                >
                  Hide completed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newValue = !showMemoOnly;
                    setShowMemoOnly(newValue);
                    localStorage.setItem(
                      "showMemoOnly",
                      JSON.stringify(newValue)
                    );
                  }}
                  className={`rounded-full px-4 shadow-none ${
                    showMemoOnly
                      ? "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:hover:text-white"
                      : "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-600 dark:hover:text-white"
                  }`}
                >
                  Memo{" "}
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {tasks.filter((task) => task.category === "MEMO").length}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newValue = !showTodayOnly;
                    setShowTodayOnly(newValue);
                    localStorage.setItem(
                      "showTodayOnly",
                      JSON.stringify(newValue)
                    );
                  }}
                  className={`rounded-full px-4 shadow-none  ${
                    showTodayOnly
                      ? "bg-indigo-50 text-indigo-600 border-indigo-600 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 dark:hover:text-white"
                      : "hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white"
                  }`}
                >
                  Today{" "}
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                    {
                      tasks.filter((task) => {
                        const taskDate = new Date(task.createdAt);
                        const today = new Date();
                        return (
                          taskDate.getDate() === today.getDate() &&
                          taskDate.getMonth() === today.getMonth() &&
                          taskDate.getFullYear() === today.getFullYear()
                        );
                      }).length
                    }
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newValue = !showJasaOnly;
                    setShowJasaOnly(newValue);
                    localStorage.setItem(
                      "showJasaOnly",
                      JSON.stringify(newValue)
                    );
                  }}
                  className={`rounded-full px-4 shadow-none ${
                    showJasaOnly
                      ? "bg-green-50 text-green-600 border-green-600 hover:bg-green-100 hover:text-green-600 dark:bg-green-600 dark:text-white dark:hover:bg-green-700 dark:hover:text-white"
                      : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-600 dark:hover:text-white"
                  }`}
                >
                  Jasa{" "}
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                    {tasks.filter((task) => task.category === "JASA").length}
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter || "all"}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="CANCEL">Cancel</SelectItem>
                  <SelectItem value="INPROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter || "all"}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="MEMO">Memo</SelectItem>
                  <SelectItem value="LAPORAN">Laporan</SelectItem>
                  <SelectItem value="TASK">Tugas</SelectItem>
                  <SelectItem value="JASA">Jasa</SelectItem>
                  <SelectItem value="MATERIAL">Material</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[255px] justify-start text-left font-normal ${
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
          <div className="rounded-t-lg border border-b-0 bg-gray-100 dark:bg-gray-700">
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-10">
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
            </Table>
          </div>
        </div>
        <div className="overflow-auto rounded-b-lg border">
          <Table className="w-full border-collapse">
            <TableBody className="dark:bg-gray-800">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-16 cursor-pointer hover:bg-gray-50/50"
                    onClick={() => {
                      setSelectedTask(row.original);
                      setEditDialogOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 font-normal"
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
                {[5, 8, 10, 20, 30, 40, 50].map((size) => (
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

        <AlertDialog open={completeTaskId !== null}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this task as completed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={(e) => {
                  e.stopPropagation();
                  setCompleteTaskId(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const task = tasks.find((t) => t.id === completeTaskId);
                    const updatedTask = {
                      ...task,
                      status: "COMPLETED",
                    };
                    await TasksAPI.updateTask(completeTaskId, updatedTask);
                    toast({
                      title: "Task marked as completed",
                      variant: "success",
                    });
                    onEditTask?.(updatedTask);
                  } catch (error) {
                    toast({
                      title: "Failed to update task",
                      description: error.message,
                      variant: "destructive",
                    });
                  } finally {
                    setCompleteTaskId(null);
                  }
                }}
              >
                Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
