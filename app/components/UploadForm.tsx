"use client";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

interface UploadFormProps {
  onSuccess?: () => void;
}

const UploadForm = ({ onSuccess }: UploadFormProps) => {
  const [inventoryCode, setInventoryCode] = useState("");
  const [available, setAvailable] = useState<number | "">(0);
  const [pricing, setPricing] = useState<number | "">(0);
  const [strainName, setStrainName] = useState(""); // Added state for strain_name
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const availableNum = typeof available === "number" ? available : 0;
    const pricingNum = typeof pricing === "number" ? pricing : 0;

    if (!inventoryCode) return setError("Please enter an inventory code");
    if (pricingNum < 0) return setError("Price cannot be negative");
    if (availableNum < 0) return setError("Available quantity cannot be negative");

    setIsLoading(true);
    
    try {
      let videoPath = null;
      let photoUrl = null;

      if (videoFile) {
        const filePath = `videos/${Date.now()}-${videoFile.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage
          .from("inventory-videos")
          .upload(filePath, videoFile);

        if (uploadError) {
          throw new Error(`Video upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("inventory-videos")
          .getPublicUrl(filePath);

        videoPath = publicUrlData.publicUrl;
      }

      if (photoFile) {
        const filePath = `photos/${Date.now()}-${photoFile.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage
          .from("inventory-photo")
          .upload(filePath, photoFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("inventory-photo")
          .getPublicUrl(filePath);

        photoUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("inventory").insert([{ 
        inventory_code: inventoryCode, 
        available: availableNum,
        pricing: pricingNum,
        strain_name: strainName || null, // Include strain_name in the insert
        video_path: videoPath, 
        photo_url: photoUrl,
      }]);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setInventoryCode("");
      setAvailable(0);
      setPricing(0);
      setStrainName(""); // Reset strain_name
      setVideoFile(null);
      setPhotoFile(null);

      if (onSuccess) onSuccess();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Inventory Code*
          </label>
          <input
            type="text"
            placeholder="Enter unique code"
            value={inventoryCode}
            onChange={(e) => setInventoryCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Strain Name
          </label>
          <input
            type="text"
            placeholder="Enter strain name"
            value={strainName}
            onChange={(e) => setStrainName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Available Quantity
          </label>
          <input
            type="number"
            value={available === 0 ? "" : available}
            onChange={(e) => setAvailable(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Price ($)
          </label>
          <input
            type="number"
            value={pricing === 0 ? "" : pricing}
            onChange={(e) => setPricing(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Video (Optional)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={() => onSuccess?.()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Save Item"}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;