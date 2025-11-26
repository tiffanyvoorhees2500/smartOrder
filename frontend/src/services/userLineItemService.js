import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export const addUserLineItemFromAdminPage = async ({ userId, productId, quantity, state }) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE}/user-line-items/admin-add-line`,
      { userId, productId, quantity, state },
      {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding line item from admin page:", error);
    throw error;
  }
};
