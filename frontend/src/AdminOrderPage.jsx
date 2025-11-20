import { useState } from "react";
import "./AdminOrderPage.css";
import AdminItemListHeader from "./components/admin/AdminItemListHeader";
import AdminOrderModal from "./components/admin/AdminOrderModal";
import AdminItem from "./components/item/AdminItem";

export default function AdminOrderPage() {
  // Feel Free to move to a context if needed
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="adminOrderPage">
      {/* Page Name */}
      <h2>Current Order Needs to be Placed with OHS</h2>

      {/* Manage Order Section */}
      <AdminItemListHeader
        className="adminSection"
        setIsVisible={setIsVisible}
      />

      {/* List of Items */}
      <div className="orderItems adminSection">
        {Array.from({ length: 10 }, (_, i) => (
          <AdminItem key={i} />
        ))}
      </div>

      {/* Modal */}
      <AdminOrderModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
}
