const API_BASE_URL = "http://localhost:4000/api/orders";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
};

export const createOrder = async (items, promoId = null, discount = 0, promoCode = null) => {
    try {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                items: items.map(item => ({
                    product: item._id,
                    quantity: item.qty,
                    price: item.price
                })),
                totalPrice: total,
                promoId: promoId || undefined,
                discount: discount || 0,
                promoCode: promoCode || undefined
            })
        });

        const data = await response.json();
        if (!response.ok) {
            // Include the detailed error from the backend if available
            const detailedError = data.error ? `: ${data.error}` : "";
            throw new Error((data.msg || "Failed to create order") + detailedError);
        }
        return data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const fetchOrders = async () => {
    try {
        const response = await fetch(API_BASE_URL, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Failed to fetch orders");
        return data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
};
