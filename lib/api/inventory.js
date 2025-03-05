import { API_URL } from "@/lib/config";

export const InventoryAPI = {
  // Get all inventory items
  getAllItems: async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/items`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }
  },

  // Get items by category
  getItemsByCategory: async (category) => {
    try {
      const response = await fetch(
        `${API_URL}/inventory/items/category/${category}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching items by category:", error);
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

  // Get transaction by reference
  getTransactionByReference: async (reference) => {
    try {
      const response = await fetch(
        `${API_URL}/inventory/transactions/reference/${encodeURIComponent(
          reference
        )}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching transaction by reference:", error);
      throw error;
    }
  },

  // Record inventory movement (both IN and OUT)
  recordMovement: async (transactionData) => {
    try {
      const response = await fetch(`${API_URL}/inventory/movements/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error recording inventory movement:", error);
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

  // Delete item
  deleteItem: async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/inventory/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (transactionId, transactionData) => {
    try {
      const response = await fetch(
        `${API_URL}/inventory/transactions/${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (transactionId) => {
    try {
      const response = await fetch(
        `${API_URL}/inventory/transactions/${transactionId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Download transaction PDF
  downloadTransactionPDF: async (transactionId) => {
    try {
      const response = await fetch(
        `${API_URL}/inventory/transactions/${transactionId}/pdf`,
        {
          method: "GET",
        }
      );
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("Error downloading transaction PDF:", error);
      throw error;
    }
  },
};
