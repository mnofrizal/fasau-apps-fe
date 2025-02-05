"use client";
import { useEffect, useState } from "react";
import { AcaraTable } from "@/components/acara-page/AcaraTable";
import { AddAcaraDialog } from "@/components/acara-page/AddAcaraDialog";
import { AcaraAPI } from "@/lib/api/acara";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function AcaraPage() {
  const [acara, setAcara] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAcara();
  }, []);

  const fetchAcara = async () => {
    try {
      setIsLoading(true);
      const response = await AcaraAPI.getAllAcara();
      if (response.success) {
        setAcara(response.data);
      } else {
        setError(response.message || "Failed to fetch acara");
      }
    } catch (err) {
      setError("An error occurred while fetching acara");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAcara = async (newAcara) => {
    try {
      await AcaraAPI.createAcara(newAcara);
      fetchAcara();
      toast({
        title: "Acara added successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to add acara",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditAcara = async (updatedAcara) => {
    try {
      await AcaraAPI.updateAcara(updatedAcara.id, updatedAcara);
      fetchAcara();
      toast({
        title: "Acara updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Failed to update acara",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAcara = () => {
    fetchAcara();
  };

  return (
    <main className="flex-1 space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            List Acara
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track your events effectively
          </p>
        </div>
        <AddAcaraDialog onAddAcara={handleAddAcara} />
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
        <AcaraTable
          acara={acara}
          onEditAcara={handleEditAcara}
          onDeleteAcara={handleDeleteAcara}
        />
      )}
      <Toaster />
    </main>
  );
}
