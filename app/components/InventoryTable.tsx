// app/components/InventoryTable.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Search, RefreshCw, FileX, Plus, X, Play, ChevronLeft, ChevronRight, Download } from "lucide-react";
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
  const [selectedMedia, setSelectedMedia] = useState<InventoryItem | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0); // 0 for photo, 1 for video
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [totalPricing, setTotalPricing] = useState<number>(0);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from("inventory").select("*");
      
      if (error) {
        throw new Error(error.message);
      }
      
      const items = data as InventoryItem[];
      setInventory(items);
      setFilteredInventory(items);
      
      // Calculate totals
      const totalAvail = items.reduce((sum, item) => sum + item.available, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.pricing, 0);
      setTotalAvailable(totalAvail);
      setTotalPricing(totalPrice);
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
      
      // Recalculate totals based on filtered data
      const totalAvail = filtered.reduce((sum, item) => sum + item.available, 0);
      const totalPrice = filtered.reduce((sum, item) => sum + item.pricing, 0);
      setTotalAvailable(totalAvail);
      setTotalPricing(totalPrice);
    } else {
      setFilteredInventory(inventory);
      const totalAvail = inventory.reduce((sum, item) => sum + item.available, 0);
      const totalPrice = inventory.reduce((sum, item) => sum + item.pricing, 0);
      setTotalAvailable(totalAvail);
      setTotalPricing(totalPrice);
    }
  }, [searchTerm, inventory]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchData();
  };

  const handleMediaClick = (item: InventoryItem) => {
    setSelectedMedia(item);
    setCurrentMediaIndex(item.photo_url ? 0 : 1); // Start with photo if available, otherwise video
  };

  const closeMediaPopup = () => {
    setSelectedMedia(null);
    setCurrentMediaIndex(0);
  };

  const handleNextMedia = () => {
    if (selectedMedia) {
      const mediaCount = [selectedMedia.photo_url, selectedMedia.video_path].filter(Boolean).length;
      setCurrentMediaIndex((prev) => (prev + 1) % mediaCount);
    }
  };

  const handlePrevMedia = () => {
    if (selectedMedia) {
      const mediaCount = [selectedMedia.photo_url, selectedMedia.video_path].filter(Boolean).length;
      setCurrentMediaIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
    }
  };

  const handleDownload = () => {
    if (selectedMedia) {
      const currentMedia = currentMediaIndex === 0 ? selectedMedia.photo_url : selectedMedia.video_path;
      if (currentMedia) {
        const link = document.createElement('a');
        link.href = currentMedia;
        link.download = currentMedia.split('/').pop() || 'media';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
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

      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 relative max-w-md w-full">
            <button
              onClick={closeMediaPopup}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              {/* Media Display */}
              {currentMediaIndex === 0 && selectedMedia.photo_url ? (
                <img
                  src={selectedMedia.photo_url}
                  alt="Item photo"
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              ) : (
                selectedMedia.video_path && (
                  <video controls className="w-full h-auto max-h-[70vh]">
                    <source src={selectedMedia.video_path} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              )}

              {/* Navigation Arrows */}
              {selectedMedia.photo_url && selectedMedia.video_path && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Footer with Download Button */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                {currentMediaIndex === 0 && selectedMedia.photo_url ? 'Photo' : 'Video'} • {selectedMedia.photo_url && selectedMedia.video_path ? `${currentMediaIndex + 1} of 2` : '1 of 1'}
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
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
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-200">Photo&Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50 odd:bg-white">
                  <td className="px-4 py-3 font-bold text-gray-800">{item.inventory_code}</td>
                  <td className="px-4 py-3 text-black">{item.available.toFixed(1)}</td>
                  <td className="px-4 py-3 text-black">${item.pricing.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      {/* Photo Display */}
                      {item.photo_url ? (
                        <button onClick={() => handleMediaClick(item)}>
                          <img 
                            src={item.photo_url} 
                            alt="Item photo" 
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </button>
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md">
                          <FileX className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Video Display */}
                      {item.video_path ? (
                        <button 
                          onClick={() => handleMediaClick(item)}
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                        >
                          <Play className="h-4 w-4" />
                          <span className="text-sm">Play</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <FileX className="h-4 w-4" />
                          <span className="text-sm">No Video</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td className="px-4 py-3 text-gray-600" colSpan={1}>
                  Showing {filteredInventory.length} of {inventory.length} records
                </td>
                <td className="px-4 py-3 text-black">Sum {totalAvailable.toFixed(1)}</td>
                <td className="px-4 py-3 text-black">Sum ${totalPricing.toFixed(2)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

const InventoryTable = dynamic(() => Promise.resolve(InventoryTableComponent), {
  ssr: false
});

export default InventoryTable;