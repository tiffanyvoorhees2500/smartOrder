import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { normalizePercent } from "./utils/normalize";

const base_url = process.env.REACT_APP_API_BASE_URL;
export const HeaderContext = createContext();

export default function HeaderContextProvider({ children }) {
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Core State
  const [items, setItems] = useState([]);
  const [discountOptions, setDiscountOptions] = useState([]);

  // discounts are numeric percentages (e.g. 0.1 or 0.15) — choose your unit (we use percent like 10 for UI)
  const [originalDiscount, setOriginalDiscount] = useState(0);
  const [pendingDiscount, setPendingDiscount] = useState(0);

  // bottles
  const [originalBulkBottles, setOriginalBulkBottles] = useState(0);
  const [pendingBulkBottles, setPendingBulkBottles] = useState(0);

  // totals
  const [originalTotal, setOriginalTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  // Cart
  const [showCart, setShowCart] = useState(false);

  // Pending changes: { productId: dbPendingQuantity }
  const [pendingChanges, setPendingChanges] = useState({});
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Load items + discount info from backend
  const loadPricing = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/products/user-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = res.data.user || [];
      const products = res.data.products || [];
      const discountInfo = res.data.discountInfo || {};

      setUser(user);

      setDiscountOptions(discountInfo.DISCOUNT_OPTIONS || []);
      setOriginalDiscount(normalizePercent(discountInfo.selectedDiscountForCurrent));
      setPendingDiscount(normalizePercent(discountInfo.selectedDiscountForPending));
      setOriginalBulkBottles(discountInfo.totalBottlesForCurrentQuantities ?? 0);
      setPendingBulkBottles(discountInfo.totalBottlesWithPendingQuantities ?? 0);

      const normItems = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalQuantity: p.originalQuantity ?? 0,
        dbPendingQuantity: p.dbPendingQuantity ?? p.originalQuantity ?? 0, // editable draft
        quantity: p.dbPendingQuantity ?? p.originalQuantity ?? 0, // for UI display if needed
        productLineItemId: p.productLineItemId ?? null,
      }));

      setItems(normItems);

      // Initialize pendingChanges based on differences
      const initialPendingChanges = {};
      normItems.forEach((item) => {
        if ((item.dbPendingQuantity ?? 0) !== (item.originalQuantity ?? 0)) {
          initialPendingChanges[item.id] = item.dbPendingQuantity ?? 0;
        }
      });
      setPendingChanges(initialPendingChanges);
    } catch (err) {
      console.error("loadPricing error:", err);
    }
    setLoadingUser(false);
  }, [token]);

  // Recalculate totals whenever items, discounts, or pendingChanges change
  useEffect(() => {
    let oTotal = 0;
    let pTotal = 0;

    items.forEach((item) => {
      const saved = item.originalQuantity ?? 0;
      const pending = pendingChanges[item.id] ?? saved;

      const origPrice = item.price * (1 - (originalDiscount ?? 0) / 100);
      const pendPrice = item.price * (1 - (pendingDiscount ?? 0) / 100);

      oTotal += saved * origPrice;
      pTotal += pending * pendPrice;
    });

    setOriginalTotal(oTotal);
    setPendingTotal(pTotal);
  }, [items, originalDiscount, pendingDiscount, pendingChanges]);

  // Update pending quantity for a single item (optimistic + persist)
  const updatePendingQuantity = useCallback(
    async (productLineItemId, productId, newPending) => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === productId ? { ...i, dbPendingQuantity: newPending } : i
        )
      );

      setPendingChanges((prev) => {
        const original = items.find((i) => i.id === productId)?.originalQuantity ?? 0;
        const updated = { ...prev };
        if (newPending === original) {
          delete updated[productId];
        } else {
          updated[productId] = newPending;
        }
        return updated;
      });

      try {
        await axios.post(
          `${base_url}/user-line-items/update-pending-quantity`,
          { productId, pendingQuantity: newPending },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("updatePendingQuantity error:", err);
      } finally {
        await loadPricing();
      }
    },
    [items, loadPricing, token]
  );

  // Save single item
  const saveItem = useCallback(
    async (productId) => {
      const item = items.find((i) => i.id === productId);
      if (!item) return;
      const quantityToSave = item.dbPendingQuantity ?? 0;

      setItems((prev) =>
        prev.map((i) =>
          i.id === productId ? { ...i, originalQuantity: quantityToSave } : i
        )
      );

      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      try {
        await axios.post(
          `${base_url}/user-line-items/save-line-item`,
          { productId, quantity: quantityToSave },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("saveItem error:", err);
      } finally {
        await loadPricing();
      }
    },
    [items, loadPricing, token]
  );

  // Save all pending changes
  const saveAll = useCallback(async () => {
    const changedItems = Object.entries(pendingChanges).map(([id, dbPendingQuantity]) => ({
      id: Number(id),
      dbPendingQuantity,
    }));

    if (changedItems.length === 0) return;

    try {
      await axios.post(
        `${base_url}/user-line-items/save-all`,
        { items: changedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadPricing();
    } catch (err) {
      console.error("saveAll error:", err);
    }
  }, [pendingChanges, loadPricing, token]);

  // Update user Ship To state
  const updateUserShipToState = useCallback(
    async (newState) => {
      if (!token) return;
      try {
        setUser((prev) => ({ ...prev, defaultShipToState: newState }));

        await axios.put(
          `${base_url}/users/update-ship-to-state`,
          { defaultShipToState: newState },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await loadPricing();
      } catch (err) {
        console.error("updateUserShipToState error:", err);
      }
    },
    [loadPricing, token]
  );

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  return (
    <HeaderContext.Provider
      value={{
        items,
        discountOptions,
        originalDiscount,
        pendingDiscount,
        originalBulkBottles,
        pendingBulkBottles,
        originalTotal,
        pendingTotal,
        hasPendingChanges,
        showCart,
        pendingChanges,

        setOriginalDiscount,
        setPendingDiscount,
        updatePendingQuantity,
        saveItem,
        saveAll,
        updateUserShipToState,
        setShowCart,
        loadPricing,

        token,
        user,
        setUser,
        loadingUser,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}