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
  const [currentMediaIndex, setCurrentMediaIndex] = useState<number>(0);
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
    setCurrentMediaIndex(item.photo_url ? 0 : 1);
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
    <div className="space-y-6 p-6 bg-gray-300 min-h-screen text-gray-100">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search inventory codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
              
              <button 
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm"
              >
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add New Inventory Item</h3>
                <button 
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <UploadForm onSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}

        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-6 relative max-w-md w-full shadow-2xl">
              <button
                onClick={closeMediaPopup}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative">
                {currentMediaIndex === 0 && selectedMedia.photo_url ? (
                  <img
                    src={selectedMedia.photo_url}
                    alt="Item photo"
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                ) : (
                  selectedMedia.video_path && (
                    <video controls className="w-full h-auto max-h-[70vh] rounded-lg">
                      <source src={selectedMedia.video_path} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )
                )}

                {selectedMedia.photo_url && selectedMedia.video_path && (
                  <>
                    <button
                      onClick={handlePrevMedia}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextMedia}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  {currentMediaIndex === 0 && selectedMedia.photo_url ? 'Photo' : 'Video'} • {selectedMedia.photo_url && selectedMedia.video_path ? `${currentMediaIndex + 1} of 2` : '1 of 1'}
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p className="text-lg font-medium">Error loading inventory: {error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p className="text-lg font-medium">No inventory items found.</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 mx-auto shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Item</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700">
                  <th className="px-6 py-4 border-b border-gray-200 font-semibold text-sm uppercase tracking-wider">Inventory Code</th>
                  <th className="px-6 py-4 border-b border-gray-200 font-semibold text-sm uppercase tracking-wider">Available</th>
                  <th className="px-6 py-4 border-b border-gray-200 font-semibold text-sm uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 border-b border-gray-200 font-semibold text-sm uppercase tracking-wider">Photo & Video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item, index) => (
                  <tr key={item.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.inventory_code}</td>
                    <td className="px-6 py-4 text-gray-800">{item.available.toFixed(1)}</td>
                    <td className="px-6 py-4 text-gray-800">${item.pricing.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.photo_url ? (
                          <button onClick={() => handleMediaClick(item)} className="group relative">
                            <img 
                              src={item.photo_url} 
                              alt="Item photo" 
                              className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform duration-200 group-hover:scale-105"
                            />
                          </button>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg shadow-sm">
                            <FileX className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        
                        {item.video_path ? (
                          <button 
                            onClick={() => handleMediaClick(item)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            <Play className="h-5 w-5" />
                            <span className="text-sm font-medium">Play</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <FileX className="h-5 w-5" />
                            <span className="text-sm font-medium">No Video</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 text-gray-700 font-semibold">
                  <td className="px-6 py-4 border-t border-gray-200 text-sm">
                    Showing {filteredInventory.length} of {inventory.length} records
                  </td>
                  <td className="px-6 py-4 border-t border-gray-200 text-sm">Sum {totalAvailable.toFixed(1)}</td>
                  <td className="px-6 py-4 border-t border-gray-200 text-sm">Sum ${totalPricing.toFixed(2)}</td>
                  <td className="px-6 py-4 border-t border-gray-200"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryTable = dynamic(() => Promise.resolve(InventoryTableComponent), {
  ssr: false
});

export default InventoryTable;