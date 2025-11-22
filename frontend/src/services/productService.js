import axios from "axios";
const base_url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Fetch product dropdown list options
export const fetchProductDropdownListOptions = async () => {
  try {
    const response = await axios.get(`${base_url}/products/dropdown`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    const data = await response.data;
    
    return data.productsList;
  } catch (error) {
    console.error("Error fetching product dropdown list options:", error);
    throw error;
  }
};