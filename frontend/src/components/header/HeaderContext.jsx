import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { normalizePercent } from "../../utils/normalize";

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

  // derived
  const hasPendingChanges = items.some(
    (i) =>
      i.dbPendingQuantity != null && i.dbPendingQuantity !== i.originalQuantity
  );

  // Load items + discount info from backend
  const loadPricing = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/products/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user || [];
      const products = res.data.products || [];
      const discountInfo = res.data.discountInfo || {};

      setUser(user);

      setDiscountOptions(discountInfo.DISCOUNT_OPTIONS || []);

      setOriginalDiscount(
        normalizePercent(discountInfo.selectedDiscountForCurrent)
      );
      setPendingDiscount(
        normalizePercent(discountInfo.selectedDiscountForPending)
      );

      setOriginalBulkBottles(
        discountInfo.totalBottlesForCurrentQuantities ?? 0
      );
      setPendingBulkBottles(
        discountInfo.totalBottlesWithPendingQuantities ?? 0
      );

      // Items: keep fields minimal and consistent
      const normItems = products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalQuantity: p.originalQuantity ?? 0,
        dbPendingQuantity: p.dbPendingQuantity ?? p.originalQuantity ?? 0, //editable draft
        quantity: p.dbPendingQuantity ?? p.originalQuantity ?? 0, // for UI display if needed
        productLineItemId: p.productLineItemId ?? null, // if you included line item id
      }));

      setItems(normItems);
    } catch (err) {
      console.error("loadPricing error:", err);
    }

    setLoadingUser(false);
  }, [token]);

  // Recalculate totals whenever items or discounts change
  useEffect(() => {
    // originalDiscount and pendingDiscount are percentages (e.g. 10 for 10%)
    let oTotal = 0;
    let pTotal = 0;

    items.forEach((item) => {
      const saved = item.originalQuantity ?? 0;
      const pending = item.dbPendingQuantity ?? saved;

      const origPrice = item.price * (1 - (originalDiscount ?? 0) / 100);
      const pendPrice = item.price * (1 - (pendingDiscount ?? 0) / 100);

      oTotal += saved * origPrice;
      pTotal += pending * pendPrice;
    });

    setOriginalTotal(oTotal);
    setPendingTotal(pTotal);
  }, [items, originalDiscount, pendingDiscount]);

  // Update pending quantity for one item (optimistic + persist)
  const updatePendingQuantity = useCallback(
    async (productLineItemId, productId, newPending) => {
      // productLineItemId may be null if user has no line item yet; you might need API that accepts productId
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === productId) {
            return { ...i, dbPendingQuantity: newPending };
          }
          return i;
        })
      );

      // Persist small write
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
    [loadPricing, token]
  );

  // Save item: commit draft to original
  const saveItem = useCallback(
    async (productId) => {
      // Optimistic update: set originalQuantity to match pendingQuantity immediately
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === productId) {
            if (i.dbPendingQuantity === 0) {
              // Line item will be deleted
              return {
                ...i,
                originalQuantity: null,
                dbPendingQuantity: null,
                productLineItemId: null,
              };
            }
            // Normal save
            return {
              ...i,
              originalQuantity: i.dbPendingQuantity,
              dbPendingQuantity: i.dbPendingQuantity,
            };
          }
          return i;
        })
      );

      try {
        const item = items.find((i) => i.id === productId);
        await axios.post(
          `${base_url}/user-line-items/save-line-item`,
          {
            productId,
            quantity: item?.dbPendingQuantity ?? 0,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("saveItem error:", err);
      } finally {
        await loadPricing(); // ensure backend is authoritative
      }
    },
    [items, loadPricing, token]
  );

  // init on mount
  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  return (
    <HeaderContext.Provider
      value={{
        // data
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

        // setters / actions
        setOriginalDiscount,
        setPendingDiscount,
        updatePendingQuantity,
        saveItem,
        reloadPricing: loadPricing,
        setShowCart,

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
