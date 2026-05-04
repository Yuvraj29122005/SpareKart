import { useEffect, useState } from "react";
import { apiFetch, getStoredAuth } from "./api";

const mapCartItems = (cart) =>
  (cart?.items || []).map((item) => ({
    id: item.product?._id,
    _id: item.product?._id,
    name: item.product?.name,
    price: item.product?.price,
    category: item.product?.category,
    stock: item.product?.stock,
    desc: item.product?.desc,
    img: item.product?.img || "",
    qty: item.qty
  }));

function useCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(() => getStoredAuth()?.token || null);

  const loadCart = async () => {
    const token = getStoredAuth()?.token;
    if (!token) {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      const data = await apiFetch("/cart");
      setCart(mapCartItems(data));
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
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

  // Re-fetch cart whenever auth token changes
  useEffect(() => {
    if (!authToken) {
      setCart([]);
      return;
    }
    loadCart();
  }, [authToken]);

  const addToCart = async (product) => {
    if (!getStoredAuth()?.token) return;
    const productId = product._id || product.id;
    const data = await apiFetch("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, qty: 1 })
    });
    setCart(mapCartItems(data));
  };

  const removeFromCart = async (id) => {
    const data = await apiFetch(`/cart/${id}`, { method: "DELETE" });
    setCart(mapCartItems(data));
  };

  const increaseQty = async (id) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    const data = await apiFetch("/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: id, qty: item.qty + 1 })
    });
    setCart(mapCartItems(data));
  };

  const decreaseQty = async (id) => {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    const data = await apiFetch("/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: id, qty: item.qty - 1 })
    });
    setCart(mapCartItems(data));
  };

  const clearCart = async () => {
    await apiFetch("/cart", { method: "DELETE" });
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    cartCount,
    loading,
    refreshCart: loadCart
  };
}

export default useCart;