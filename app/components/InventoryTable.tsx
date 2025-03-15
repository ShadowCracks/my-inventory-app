// app/components/InventoryTable.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Search, RefreshCw, Film, FileX, Plus, X } from "lucide-react";
import dynamic from 'next/dynamic';
import UploadForm from "./UploadForm";

interface InventoryItem {
  id: string;
  inventory_code: string;
  available: number;
  pricing: number;
  photo_url?: string;
  video_path?: string;
  created_at: string;
}

const InventoryTableComponent = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from("inventory").select("*");
      
      if (error) {
        throw new Error(error.message);
      }
      
      setInventory(data as InventoryItem[]);
      setFilteredInventory(data as InventoryItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching inventory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = inventory.filter(item => 
        item.inventory_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchData(); // Refresh the data after successful upload
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Items</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-black-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-black-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
            />


          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button 
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Inventory Item</h3>
              <button 
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <UploadForm onSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          <p>Error loading inventory: {error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No inventory items found.</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Item</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">Inventory Code</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">Available</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.inventory_code}</td>
                  <td className="px-4 py-3">{item.available}</td>
                  <td className="px-4 py-3">${item.pricing.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {item.video_path ? (
                      <div className="relative group">
                        <div className="flex items-center gap-2">
                          <Film className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-500 cursor-pointer">View Video</span>
                        </div>
                        
                        <div className="absolute hidden group-hover:block z-10 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
                          <video controls className="h-40 w-64 bg-black">
                            <source src={item.video_path} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <FileX className="h-4 w-4" />
                        <span className="text-sm">No Video</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
        Showing {filteredInventory.length} of {inventory.length} inventory items
      </div>
    </div>
  );
};

// Use dynamic import with ssr: false to avoid hydration errors
const InventoryTable = dynamic(() => Promise.resolve(InventoryTableComponent), {
  ssr: false
});

export default InventoryTable;