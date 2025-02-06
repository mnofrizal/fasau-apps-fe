import { API_URL } from "@/lib/config";

export const AcaraAPI = {
  getAllAcara: async () => {
    try {
      const response = await fetch(`${API_URL}/acara`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching acara:", error);
      throw error;
    }
  },

  createAcara: async (acaraData) => {
    try {
      const response = await fetch(`${API_URL}/acara`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(acaraData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating acara:", error);
      throw error;
    }
  },

  updateAcara: async (acaraId, acaraData) => {
    try {
      const response = await fetch(`${API_URL}/acara/${acaraId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(acaraData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating acara:", error);
      throw error;
    }
  },

  deleteAcara: async (acaraId) => {
    try {
      const response = await fetch(`${API_URL}/acara/${acaraId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting acara:", error);
      throw error;
    }
  },
};
