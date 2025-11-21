import { useState } from "react";
import "./AdminOrderPage.css";
import AdminItemListHeader from "./components/admin/AdminItemListHeader";
import AdminOrderModal from "./components/admin/AdminOrderModal";
import AdminItem from "./components/item/AdminItem";

export default function AdminOrderPage() {
  // Feel Free to move to a context if needed
  const [isVisible, setIsVisible] = useState(false);

  const adminItems = [
    {
      id: 1,
      name: "Sample Item",
      wholesalePrice: 10,
      retailPrice: 15,
      discountPercentage: 0,
      userItems: [
        {
          userId: 1,
          price: 15,
          quantity: 50,
          name: "Example User"
        },
        {
          userId: 2,
          price: 15,
          quantity: 50,
          name: "Example User 2"
        },
        {
          userId: 3,
          price: 15,
          quantity: 50,
          name: "Example User 3"
        },
        {
          userId: 4,
          price: 15,
          quantity: 50,
          name: "Example User 4"
        }
      ]
    },
    {
      id: 2,
      name: "Sample Item 2",
      wholesalePrice: 10,
      retailPrice: 15,
      discountPercentage: 15,
      userItems: [
        {
          userId: 1,
          price: 15,
          quantity: 50,
          name: "Example User 1"
        }
      ]
    },
    {
      id: 3,
      name: "Sample Item 3",
      wholesalePrice: 10,
      retailPrice: 15,
      discountPercentage: 10,
      userItems: [
        {
          userId: 4,
          price: 12,
          quantity: 60,
          name: "Example User 4"
        },
        {
          userId: 3,
          price: 18,
          quantity: 40,
          name: "Example User 3"
        },
        {
          userId: 1,
          price: 11,
          quantity: 70,
          name: "Example User 1"
        }
      ]
    }
  ];

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
        {adminItems.map((adminItem) => (
          <AdminItem key={adminItem.id} adminItem={adminItem} />
        ))}
      </div>

      {/* Modal */}
      <AdminOrderModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </div>
  );
}
