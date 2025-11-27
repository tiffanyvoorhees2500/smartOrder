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

export const updateProductWholesalePrice = async (
  productId,
  newWholesalePrice
) => {
  try {
    const response = await axios.put(
      `${base_url}/products/${productId}/wholesale-price`,
      { wholesalePrice: newWholesalePrice },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product wholesale price:", error);
    throw error;
  }
};

export const updateProductRetailPrice = async (productId, newRetailPrice) => {
  try {
    const response = await axios.put(
      `${base_url}/products/${productId}/retail-price`,
      { retailPrice: newRetailPrice },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product retail price:", error);
    throw error;
  }
};
