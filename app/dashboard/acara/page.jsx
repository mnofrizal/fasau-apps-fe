"use client";
import { acaraData } from "@/contants/mockData";
import { AcaraTable } from "@/components/acara-page/AcaraTable";
import { AddAcaraDialog } from "@/components/acara-page/AddAcaraDialog";

export default function AcaraPage() {
  const handleAddAcara = (newAcara) => {
    newAcara.id = acaraData.length + 1;
    acaraData.push(newAcara);
  };

  const handleEditAcara = (updatedAcara) => {
    const index = acaraData.findIndex((acara) => acara.id === updatedAcara.id);
    if (index !== -1) {
      acaraData[index] = updatedAcara;
    }
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

      <AcaraTable acara={acaraData} onEditAcara={handleEditAcara} />
    </main>
  );
}
