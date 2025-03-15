// app/inventory/page.tsx
import InventoryPag from "./components/InventoryPag";

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Inventory Dashboard</h1>
      <InventoryPag/>
    </div>
  );
}
