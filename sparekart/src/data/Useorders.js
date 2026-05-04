import { useEffect, useState } from "react";
import { apiFetch, getStoredAuth } from "./api";

const mapOrder = (order) => ({
  id: order._id,
  date: new Date(order.createdAt).toISOString().split("T")[0],
  address: order.shippingAddress,
  paymentMethod: order.paymentMethod,
  payment: order.paymentStatus,
  products: order.items.map((item) => ({
    name: item.name,
    price: item.price,
    qty: item.qty,
    img: item.img || ""
  }))
});

function useOrders(clearCart) {
  const [orders, setOrders] = useState([]);
  const [authToken, setAuthToken] = useState(() => getStoredAuth()?.token || null);

  const loadOrders = async () => {
    const token = getStoredAuth()?.token;
    if (!token) {
      setOrders([]);
      return;
    }
    try {
      const data = await apiFetch("/orders/my");
      setOrders(data.map(mapOrder));
    } catch {
      setOrders([]);
    }
  };

  // Poll for auth token changes (login/logout/register)
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = getStoredAuth()?.token || null;
      if (currentToken !== authToken) {
        setAuthToken(currentToken);
      }
    };
    const interval = setInterval(checkAuth, 500);
    return () => clearInterval(interval);
  }, [authToken]);

  // Re-fetch orders whenever auth token changes
  useEffect(() => {
    if (!authToken) {
      setOrders([]);
      return;
    }
    loadOrders();
  }, [authToken]);

  const addOrder = async ({ shippingAddress, paymentMethod, directItems, razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
    const created = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({ 
        shippingAddress, 
        paymentMethod, 
        directItems, 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature 
      })
    });
    if (!directItems || directItems.length === 0) {
      await clearCart();
    }
    setOrders((prev) => [mapOrder(created), ...prev]);
  };

  const clearOrders = async () => {
    setOrders([]);
  };

  return { orders, addOrder, clearOrders, refreshOrders: loadOrders };
}

export default useOrders;