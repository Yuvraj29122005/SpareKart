import { useState } from "react";

function useOrders(clearCart) {
  const [orders, setOrders] = useState([]);

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
    clearCart();
  };

  const clearOrders = () => setOrders([]);

  return { orders, addOrder, clearOrders };
}

export default useOrders;