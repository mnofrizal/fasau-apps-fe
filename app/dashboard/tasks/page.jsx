"use client";
import { useEffect, useState } from "react";
import { TaskTable } from "@/components/task-page/TaskTable";
import { AddTaskDialog } from "@/components/task-page/AddTaskDialog";
import { TasksAPI } from "@/lib/api/tasks";
import { Toaster } from "@/components/ui/toaster";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
    console.log({ tasks });
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await TasksAPI.getAllTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("An error occurred while fetching tasks");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = () => {
    fetchTasks(); // Refresh data from server after adding task
  };

  const handleEditTask = () => {
    fetchTasks(); // Refresh data from server after editing task
  };

  return (
    <main className="flex w-full flex-col space-y-6 px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            List Pekerjaan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track your tasks effectively
          </p>
        </div>
        <AddTaskDialog onAddTask={handleAddTask} />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={fetchTasks}
        />
      )}
      <Toaster />
    </main>
  );
}
