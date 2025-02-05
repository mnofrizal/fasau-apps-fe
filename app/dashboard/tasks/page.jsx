"use client";
import { monitoringTasks } from "@/contants/mockData";
import { TaskTable } from "@/components/task-page/TaskTable";
import { AddTaskDialog } from "@/components/task-page/AddTaskDialog";

export default function TasksPage() {
  const handleAddTask = (newTask) => {
    newTask.id = monitoringTasks.length + 1;
    monitoringTasks.push(newTask);
  };

  const handleEditTask = (updatedTask) => {
    const index = monitoringTasks.findIndex(
      (task) => task.id === updatedTask.id
    );
    if (index !== -1) {
      monitoringTasks[index] = updatedTask;
    }
  };

  return (
    <main className="flex-1 space-y-6 py-8">
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

      <TaskTable tasks={monitoringTasks} onEditTask={handleEditTask} />
    </main>
  );
}
