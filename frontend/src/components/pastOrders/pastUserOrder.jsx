import "./pastUserOrder.css";
// import InlayInputBox from "../form/InlayInputBox";
import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import PastOrder from "./pastOrder";
import Loading from "../misc/Loading";

export default function PastUserOrder() {
  // Fetch admin items from backend API
  const base_url = process.env.REACT_APP_API_BASE_URL;
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  const LIMIT = 10;

  const [pastOrders, setPastOrders] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const loaderRef = useRef(null);

  const fetchPastOrders = useCallback(
    async (offset = 0) => {
      try {
        // Only show bottom loader on *additional loads*, not first load
        if (offset > 0) setIsFetchingMore(true);

        const response = await axios.get(
          `${base_url}/admin/past-by-product?limit=${LIMIT}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const newData = response.data;
        // Append instead of overwrite
        setPastOrders((prev) => [...prev, ...newData]);

        // Track if backend returned fewer items → means no more data
        if (newData.length < LIMIT) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching admin items:", error);
      }
      setInitialLoaded(true);
    },
    [base_url, token]
  );

  // Fetch when offset changes
  useEffect(() => {
    if (hasMore) {
      fetchPastOrders(offset);
    }
  }, [offset, hasMore, fetchPastOrders]);

  // IntersectionObserver to load next batch
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          setOffset((prev) => prev + LIMIT);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  const groupByOptions = ["person", "product"];
  const [groupBy] = useState(groupByOptions[1]);

  return (
    <div className="pastOrders">
      {/* Page Title */}
      <h2>All OHS Past Orders</h2>
      {!initialLoaded && <Loading />}

      {/* Group Order By Section */}
      {/* <div className="groupSection">
        <span>Group Order By</span>

        <InlayInputBox title={"Group By"} htmlFor={"groupby"}>
          <select
            name="groupby"
            id="groupby"
            onChange={(e) => setGroupBy(e.target.value)}
          >
            {groupByOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </InlayInputBox>
      </div> */}

      {/* Past Orders Container */}
      <div className="orderContainer">
        {pastOrders.map((pastOrder, index) => (
          <PastOrder
            pastOrder={pastOrder}
            key={pastOrder.adminOrderId}
            groupBy={groupBy}
            index={index}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={loaderRef} />

      {isFetchingMore && (
        <div className="infiniteLoader">
          <Loading /> {/* 👈 your existing spinner component */}
        </div>
      )}
    </div>
  );
}
