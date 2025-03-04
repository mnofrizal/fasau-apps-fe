"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryAPI } from "@/lib/api/inventory";
import { Toaster } from "@/components/ui/toaster";
import { InventoryTable } from "@/components/inventory-page/InventoryTable";
import { TransactionTable } from "@/components/inventory-page/TransactionTable";
import { AddInventoryDialog } from "@/components/inventory-page/AddInventoryDialog";
import { TakeInventoryDialog } from "@/components/inventory-page/TakeInventoryDialog";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [inventoryResponse, transactionsResponse] = await Promise.all([
          InventoryAPI.getAllItems(),
          InventoryAPI.getTransactions(),
        ]);

        if (inventoryResponse.success) {
          setInventory(inventoryResponse.data || []);
        }

        if (transactionsResponse.success) {
          setTransactions(transactionsResponse.data || []);
        }
      } catch (err) {
        setError("Failed to fetch inventory data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [inventoryResponse, transactionsResponse] = await Promise.all([
        InventoryAPI.getAllItems(),
        InventoryAPI.getTransactions(),
      ]);

      if (inventoryResponse.success) {
        setInventory(inventoryResponse.data || []);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data || []);
      }
    } catch (err) {
      setError("Failed to refresh inventory data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage inventory items and track transactions
          </p>
        </div>
        <div className="flex gap-2">
          <AddInventoryDialog onSuccess={refreshData} />
          <TakeInventoryDialog onSuccess={refreshData} inventory={inventory} />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory">
          <InventoryTable inventory={inventory} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionTable transactions={transactions} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      <Toaster />
    </main>
  );
}
