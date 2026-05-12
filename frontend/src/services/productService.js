const API_BASE_URL = "http://localhost:4000/api/products";

export const fetchProducts = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || "Failed to fetch products");
        }
        return data.products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || "Failed to fetch product");
        }
        return data.product;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};
