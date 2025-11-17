import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';

const base_url = process.env.REACT_APP_API_BASE_URL;
export const HeaderContext = createContext();

export default function HeaderContextProvider({ children }) {
  const token = typeof window !== 'undefined' && localStorage.getItem('token');

  // Core State
  const [items, setItems] = useState([]);
  const [discountOptions, setDiscountOptions] = useState([]);

  // discounts are numeric percentages (e.g. 0.1 or 0.15) — choose your unit (we use percent like 10 for UI)
  const [originalDiscount, setOriginalDiscount] = useState(0);
  const [pendingDiscount, setPendingDiscount] = useState(0);

  // bottles & totals
  const [originalBulkBottles, setOriginalBulkBottles] = useState(0);
  const [pendingBulkBottles, setPendingBulkBottles] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);

  // derived
  const hasPendingChanges = items.some(
    (i) =>
      (i.dbPendingQuantity ?? i.originalQuantity ?? 0) !==
      (i.originalQuantity ?? 0)
  );

  // Load items + discount info from backend
  const loadPricing = useCallback(async () => {
    try {
      const res = await axios.get(`${base_url}/products/user-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = res.data.products || [];
      const discountInfo = res.data.discountInfo || {};

      // normalize: ensure numeric discount values (percent number, not fraction)
      // backend should send selectedDiscountForCurrent.discount as fraction (0.1) or percent; adapt here
      // We'll accept either: if discount < 1 assume fraction -> convert to percent*100
      const selCur = discountInfo.selectedDiscountForCurrent;
      const selPen = discountInfo.selectedDiscountForPending;

      const normalize = (d) => {
        if (d == null) return 0;
        if (typeof d === 'object' && d.discount != null) {
          // object from old code: {discount: 0.1}
          return d.discount < 1 ? d.discount * 100 : d.discount;
        }
        // number
        return d < 1 ? d * 100 : d;
      };

      setDiscountOptions(discountInfo.DISCOUNT_OPTIONS || []);

      setOriginalDiscount(normalize(selCur));
      setPendingDiscount(normalize(selPen));

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
        quantity: p.originalQuantity ?? 0,
        pendingQuantity: p.dbPendingQuantity ?? p.originalQuantity ?? 0,
        productLineItemId: p.productLineItemId ?? null, // if you included line item id
      }));

      setItems(normItems);
    } catch (err) {
      console.error('loadPricing error:', err);
    }
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
          if (i.productLineItemId === productLineItemId || i.id === productId) {
            return { ...i, dbPendingQuantity: newPending };
          }
          return i;
        })
      );

      // Persist small write
      try {
        await axios.post(
          `${base_url}/user-line-items/update-pending-quantity`,
          {
            productId,
            pendingQuantity: newPending,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // fetch authoritative discount info & totals to be safe
        await loadPricing();
      } catch (err) {
        console.error('updatePendingQuantity error:', err);
        // optional: revert or reload
        await loadPricing();
      }
    },
    [loadPricing, token]
  );

  // Save pending -> quantity (commit)
  const saveItem = useCallback(
    async (productLineItemId, productId) => {
      try {
        // call save endpoint for single line-item (your backend earlier had save-line-item)
        await axios.post(
          `${base_url}/user-line-items/save-line-item`,
          {
            productId,
            quantity:
              items.find((i) => i.id === productId)?.dbPendingQuantity ?? 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // refresh authoritative state
        await loadPricing();
      } catch (err) {
        console.error('saveItem error:', err);
        await loadPricing();
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

        // setters / actions
        setOriginalDiscount: (val) => setOriginalDiscount(val),
        setPendingDiscount: (val) => setPendingDiscount(val),
        updatePendingQuantity,
        saveItem,
        reloadPricing: loadPricing,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
