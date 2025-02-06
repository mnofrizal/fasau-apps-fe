import { create } from "zustand";
import { TasksAPI } from "@/lib/api/tasks";
import { AcaraAPI } from "@/lib/api/acara";
import { getReportsToday } from "@/lib/api/reports";

const useMonitoringStore = create((set, get) => ({
  tasks: [],
  reports: [],
  acara: [],
  isLoading: false,
  error: null,

  // Tasks actions
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await TasksAPI.getAllTasks();
      if (response.success) {
        set({ tasks: response.data });
      } else {
        set({ error: response.message || "Failed to fetch tasks" });
      }
    } catch (err) {
      set({ error: "An error occurred while fetching tasks" });
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Reports actions
  fetchReports: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getReportsToday();
      if (response.success) {
        set({ reports: response.data });
      } else {
        set({ error: response.message || "Failed to fetch reports" });
      }
    } catch (err) {
      set({ error: "An error occurred while fetching reports" });
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Acara actions
  fetchAcara: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await AcaraAPI.getAllAcara();
      if (response.success) {
        set({ acara: response.data });
      } else {
        set({ error: response.message || "Failed to fetch acara" });
      }
    } catch (err) {
      set({ error: "An error occurred while fetching acara" });
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Initialize all data
  initializeData: async () => {
    const store = get();
    await Promise.all([
      store.fetchTasks(),
      store.fetchReports(),
      store.fetchAcara(),
    ]);
  },
}));

export default useMonitoringStore;
