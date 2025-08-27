import { API_URL } from "@/lib/config";

export const PMAPI = {
  sendPMToday: async (groupOnly = false) => {
    try {
      const response = await fetch(`${API_URL}/pm/send-today`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupOnly }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending PM today:", error);
      throw error;
    }
  },
};
