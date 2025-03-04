import { API_URL } from "@/lib/config";

export const InventoryAPI = {
  // Get all inventory items
  getAllItems: async () => {
    try {
      const response = await fetch(`${API_URL}/inventory`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }
  },

  // Get all inventory transactions
  getTransactions: async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/transactions`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      throw error;
    }
  },

  // Add items to inventory (IN transaction)
  addItems: async (transactionData) => {
    try {
      const response = await fetch(`${API_URL}/inventory/in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding inventory items:", error);
      throw error;
    }
  },

  // Take items from inventory (OUT transaction)
  takeItems: async (transactionData) => {
    try {
      const response = await fetch(`${API_URL}/inventory/out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error taking inventory items:", error);
      throw error;
    }
  },

  // Get item details
  getItemDetails: async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/inventory/items/${itemId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error;
    }
  },

  // Update item details
  updateItem: async (itemId, itemData) => {
    try {
      const response = await fetch(`${API_URL}/inventory/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  },
};
