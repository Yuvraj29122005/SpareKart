import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// ── Data hooks ──
import useCart from "./data/Usecart";
import useOrders from "./data/Useorders";
import { apiFetch } from "./data/api";

// ── Auth pages ──
import Login from "./authentication/pages/Login";
import Register from "./authentication/pages/Register";
import ForgotPassword from "./authentication/pages/ForgotPassword";

// ── User pages ──
import Home from "./user/pages/Home";
import Products from "./user/pages/Products";
import ProductDetails from "./user/pages/ProductDetails";
import Cart from "./user/pages/Cart";
import Checkout from "./user/pages/Checkout";
import Orders from "./user/pages/Orders";
import OrderDetails from "./user/pages/OrderDetails";
import Profile from "./user/pages/Profile";
import Feedback from "./user/pages/Feedback";

// ── Admin pages ──
import AdminDashboard    from "./admin/pages/Admindashboard";
import AdminProducts     from "./admin/pages/Adminproducts";
import AdminOrders       from "./admin/pages/Adminorders";
import AdminOrderDetails from "./admin/pages/AdminOrderDetails";
import AdminUsers        from "./admin/pages/AdminUsers";
import AdminFeedback     from "./admin/pages/AdminFeedback";
import AdminProfile      from "./admin/pages/AdminProfile";

function App() {
  const { cart, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart, cartCount } = useCart();
  const { orders, addOrder, clearOrders } = useOrders(clearCart);

  useEffect(() => {
    apiFetch("/products/seed/default", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />

      {/* ── Auth ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot"   element={<ForgotPassword />} />

      {/* ── User Pages ── */}
      <Route path="/home"        element={<Home addToCart={addToCart} cartCount={cartCount} />} />
      <Route path="/products"    element={<Products addToCart={addToCart} cartCount={cartCount} />} />
      <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} cartCount={cartCount} />} />
      <Route path="/cart"        element={<Cart cart={cart} removeFromCart={removeFromCart} increaseQty={increaseQty} decreaseQty={decreaseQty} cartCount={cartCount} />} />
      <Route path="/checkout"    element={<Checkout cart={cart} cartCount={cartCount} addOrder={addOrder} />} />
      <Route path="/orders"      element={<Orders orders={orders} clearOrders={clearOrders} cartCount={cartCount} />} />
      <Route path="/order/:id"   element={<OrderDetails />} />
      <Route path="/profile"     element={<Profile />} />
      <Route path="/feedback"    element={<Feedback />} />

      {/* ── Admin Pages ── */}
      <Route path="/admin"           element={<Navigate to="/admin/dashboard" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products"  element={<AdminProducts />} />
      <Route path="/admin/orders"    element={<AdminOrders />} />
      <Route path="/admin/order/:id" element={<AdminOrderDetails />} />
      <Route path="/admin/users"     element={<AdminUsers />} />
      <Route path="/admin/feedback"  element={<AdminFeedback />} />
      <Route path="/admin/profile"   element={<AdminProfile />} />

    </Routes>
  );
}

export default App;