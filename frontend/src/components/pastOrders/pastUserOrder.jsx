import "./pastUserOrder.css";
// import InlayInputBox from "../form/InlayInputBox";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import PastOrder from "./pastOrder";
import Loading from "../misc/Loading";

export default function PastUserOrder() {
  // Fetch admin items from backend API
  const base_url = process.env.REACT_APP_API_BASE_URL;
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  const fetchPastOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${base_url}/admin/past-by-product`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setPastOrders(data);
    } catch (error) {
      console.error("Error fetching admin items:", error);
    }
    setLoaded(true)
  }, [base_url, token]);

  useEffect(() => {
    fetchPastOrders();
  }, [fetchPastOrders]);

  const [pastOrders, setPastOrders] = useState([]);
  const groupByOptions = ["person", "product"];
  const [groupBy] = useState(groupByOptions[1]);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="pastOrders">
      {/* Page Title */}
      <h2>All OHS Past Orders</h2>
      {!loaded && <Loading />}

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
    </div>
  );
}
