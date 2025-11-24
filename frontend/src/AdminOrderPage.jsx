import { useState, useEffect, useMemo } from "react";
import "./AdminOrderPage.css";
import AdminItemListHeader from "./components/admin/AdminItemListHeader";
import AdminOrderModal from "./components/admin/AdminOrderModal";
import AdminItem from "./components/item/AdminItem";
import axios from 'axios';

export default function AdminOrderPage() {
  // Feel Free to move to a context if needed
  const base_url = process.env.REACT_APP_API_BASE_URL;
  const token = typeof window !== "undefined" && localStorage.getItem("token");
  
  const [isVisible, setIsVisible] = useState(false);
  const [adminItems, setAdminItems] = useState([]);
  const [selectedShipToState, setSelectedShipToState] = useState("UT");
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);

  useEffect(() => {
    // Fetch admin items from backend API
    async function fetchAdminItems() {
      try {
        const response = await axios.get(`${base_url}/products/admin-list?shipToState=${selectedShipToState}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        console.log("Response Data:", data);

        setAdminItems(data.adminLineItems);
        setDiscountOptions(data.adminDiscountInfo.DISCOUNT_OPTIONS || []);
        setSelectedShipToState(data.adminShipToState);
        setSelectedDiscount(data.adminDiscountInfo.selectedDiscountForCurrent);
      } catch (error) {
        console.error("Error fetching admin items:", error);
      }
    }

    fetchAdminItems();
  }, [base_url, token, selectedShipToState]);

  const discountedAdminItems = useMemo(() => {
    return adminItems.map(item => {
      return {
        ...item,
        discountPercentage: selectedDiscount,
      };
    });
  }, [adminItems, selectedDiscount]);

  console.log("Admin Items:", discountedAdminItems);

  return (
    <div className="adminOrderPage">
      {/* Page Name */}
      <h2>Current Order Needs to be Placed with OHS</h2>

      {/* Manage Order Section */}
      <AdminItemListHeader
        className="adminSection"
        setIsVisible={setIsVisible}
        discountOptions={discountOptions}
        setSelectedDiscount={setSelectedDiscount}
        selectedDiscount={selectedDiscount}
        setSelectedShipToState={setSelectedShipToState}
        selectedShipToState={selectedShipToState}
      />

      {/* List of Items */}
      <div className="orderItems adminSection">
        {discountedAdminItems.map((adminItem) => (
          <AdminItem key={adminItem.id} adminItem={adminItem} adminDiscountPercentage={selectedDiscount} />
        ))}
      </div>

      {/* Modal */}
      <AdminOrderModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
}
