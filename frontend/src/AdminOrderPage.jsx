import { useState, useEffect, useMemo } from "react";
import "./AdminOrderPage.css";
import AdminItemListHeader from "./components/admin/AdminItemListHeader";
import AdminOrderModal from "./components/admin/AdminOrderModal";
import AdminItem from "./components/item/AdminItem";
import axios from "axios";
import { toDecimalPercent, toWholePercent } from "./utils/normalize";
import { fetchUserDropdownListOptions } from "./services/userService";
import { getUserFromToken } from "./utils/auth";

export default function AdminOrderPage() {
  // Feel Free to move to a context if needed
  const base_url = process.env.REACT_APP_API_BASE_URL;
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  const [isVisible, setIsVisible] = useState(false);
  const [adminItems, setAdminItems] = useState([]);
  const [selectedShipToState, setSelectedShipToState] = useState(getUserFromToken()?.defaultShipToState || "UT");
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [numberBottles, setNumberBottles] = useState(0);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);

  const [adminTaxAmount, setAdminTaxAmount] = useState(0);
  const [adminShippingAmount, setAdminShippingAmount] = useState(0);
  const [paidByUserId, setPaidByUserId] = useState(getUserFromToken().id);
  const [userOrders, setUserOrders] = useState([]);

  // Fetch users once
  useEffect(() => {
    const loadUsersList = async () => {
      try {
        const usersList = await fetchUserDropdownListOptions();
        setUsersList(usersList);
      } catch (error) {
        console.error("Error fetching admin users:", error);
        setUserError("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsersList();
  });

  useEffect(() => {
    // Fetch admin items from backend API
    async function fetchAdminItems() {
      try {
        const response = await axios.get(
          `${base_url}/products/admin-list?shipToState=${selectedShipToState}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const data = response.data;
        console.log("Fetched admin items:", data);

        setAdminItems(data.adminLineItems);

        setDiscountOptions(data.adminDiscountInfo.DISCOUNT_OPTIONS || []);
        setSelectedShipToState(data.adminShipToState);
        setSelectedDiscount(
          toWholePercent(data.adminDiscountInfo.selectedDiscountForCurrent)
        );
        setNumberBottles(
          data.adminDiscountInfo.totalBottlesForCurrentQuantities
        );
      } catch (error) {
        console.error("Error fetching admin items:", error);
      }
    }

    fetchAdminItems();
  }, [base_url, token, selectedShipToState]);

  // Recompute userOrders when adminItems, selectedDiscount, adminShippingAmount, or adminTaxAmount change
  useEffect(() => {
    if (!adminItems.length) return;

    // group items by user for userOrders
    const grouped = {};

    adminItems.forEach((adminItem) => {
      const finalPrice =
        adminItem.wholesale -
        adminItem.wholesale *
          toDecimalPercent(toWholePercent(selectedDiscount));

      adminItem.userItems.forEach((userItem) => {
        const userId = userItem.userId;
        const userName = userItem.name;
        const userQuantity = userItem.quantity;

        if (!grouped[userId]) {
          grouped[userId] = {
            userId,
            user: userName,
            subtotal: 0,
            shipping: 0, // will split later
            taxes: 0 // will split later
          };
        }

        grouped[userId].subtotal += finalPrice * userQuantity;
      });
    });

    // Convert object to array
    const computedUserOrders = Object.values(grouped);

    // Set shipping/Tax amounts
    const numUsers = computedUserOrders.length;
    console.log("Number of users in order:", numUsers);
    const shippingPerUser = adminShippingAmount
      ? adminShippingAmount / numUsers
      : 0;
    const taxPerUser = adminTaxAmount ? adminTaxAmount / numUsers : 0;
    console.log(shippingPerUser, taxPerUser);

    computedUserOrders.forEach((u) => {
      u.shipping = shippingPerUser;
      u.taxes = taxPerUser;
    });

    setUserOrders(computedUserOrders);
    console.log("Computed user orders:", computedUserOrders);
  }, [adminItems, selectedDiscount, adminShippingAmount, adminTaxAmount]);

  // Handle quantity change in PriceQtyGroup
  const handleQuantityChange = async (productId, userId, newQuantity) => {
    try {
      const response = await axios.patch(
        `${base_url}/user-line-items`,
        { productId, userId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update admin items with returned updated data
      setAdminItems(response.data.adminLineItems);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  // Memoized discounted admin items (to avoid unnecessary recalculations) with subtotal calculation
  const discountedAdminItems = useMemo(() => {
    return adminItems.map((item) => {
      const finalPrice =
        item.wholesale - item.wholesale * toDecimalPercent(selectedDiscount);
      const subtotal = finalPrice * item.adminQuantity;

      return {
        ...item,
        discountPercentage: selectedDiscount,
        finalPrice,
        subtotal
      };
    });
  }, [adminItems, selectedDiscount]);

  // Calculate grand total
  const adminSubtotal = useMemo(() => {
    return discountedAdminItems.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  }, [discountedAdminItems]);

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
        numberBottles={numberBottles}
        adminSubtotal={adminSubtotal}
        usersList={usersList}
        loadingUsers={loadingUsers}
        userError={userError}
        adminTaxAmount={adminTaxAmount}
        setAdminTaxAmount={setAdminTaxAmount}
        adminShippingAmount={adminShippingAmount}
        setAdminShippingAmount={setAdminShippingAmount}
      />

      {/* List of Items */}
      <div className="orderItems adminSection">
        {discountedAdminItems.map((adminItem) => (
          <AdminItem
            key={adminItem.id}
            adminItem={adminItem}
            adminDiscountPercentage={selectedDiscount}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {/* Modal */}
      <AdminOrderModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        userOptions={usersList}
        paidByUserId={paidByUserId}
        setPaidByUserId={setPaidByUserId}
        userOrders={userOrders}
        setUserOrders={setUserOrders}
        adminSubtotal={adminSubtotal}
        adminTaxAmount={adminTaxAmount}
        adminShippingAmount={adminShippingAmount}
      />
    </div>
  );
}
