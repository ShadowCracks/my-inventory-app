// app/components/InventoryPage.tsx
"use client";
import { useState } from "react";
import dynamic from 'next/dynamic';
import UploadForm from "./UploadForm";
import { Plus } from "lucide-react";

// Import the InventoryTable component with dynamic to avoid hydration errors
const InventoryTable = dynamic(() => import("./InventoryTable"), {
  ssr: false
});

const InventoryPage = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black-800">Inventory Management</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Item</span>
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-black-800 mb-4">Add New Inventory Item</h2>
          <UploadForm onSuccess={() => setShowUploadForm(false)} />
        </div>
      )}

      <InventoryTable />
    </div>
  );
};

export default InventoryPage;