import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Adminlayout from "./Adminlayout";
import "../css/AdminOrderDetails.css";
import { apiFetch } from "../../data/api";

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/admin/orders/${id}`);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const normalized = useMemo(() => {
    if (!order) return null;
    return {
      id: order._id,
      status: order.paymentStatus,
      date: new Date(order.createdAt).toLocaleDateString(),
      payment: `${order.paymentStatus} via ${order.paymentMethod}`,
      items: order.items.map((item, idx) => ({ ...item, id: idx + 1 })),
      customer: {
        name: order.user?.name || "Customer",
        since: new Date(order.createdAt).getFullYear(),
        email: order.user?.email || "N/A",
        phone: "N/A"
      },
      shipping: {
        line1: order.shippingAddress,
        city: "",
        country: "India"
      }
    };
  }, [order]);

  if (loading) {
    return <Adminlayout><div className="aod-page"><p>Loading...</p></div></Adminlayout>;
  }

  if (!normalized) {
    return (
      <Adminlayout>
        <div className="aod-page">
          <h2 className="aod-title">Order Not Found</h2>
          <p className="aod-subtitle">The order you are looking for does not exist.</p>
          <button className="aod-back-btn" onClick={() => navigate("/admin/orders")}>
            ← Back to Orders
          </button>
        </div>
      </Adminlayout>
    );
  }

  const subtotal  = normalized.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping  = 0;
  const total     = subtotal + shipping;

  return (
    <Adminlayout>
      <div className="aod-page">

        {/* ── Header ── */}
        <h2 className="aod-title">Order Details</h2>
        <p className="aod-subtitle">View and manage order information</p>

        {/* ── Order Meta ── */}
        <div className="aod-meta">
          <div className="aod-meta-left">
            <span className="aod-order-id">Order #{normalized.id}</span>
            <span className={`aod-badge aod-badge-${normalized.status.toLowerCase()}`}>
              {normalized.status}
            </span>
          </div>
        </div>

        {/* ── Meta Info Row ── */}
        <div className="aod-meta-row">
          <span className="aod-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {normalized.date}
          </span>
          <span className="aod-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            {normalized.payment}
          </span>
        </div>

        {/* ── Content Layout ── */}
        <div className="aod-content">

          {/* ── Left: Items + Summary ── */}
          <div className="aod-main">

            {/* Items */}
            <div className="aod-items">
              {normalized.items.map((item) => (
                <div className="aod-item-row" key={item.id}>
                  <div className="aod-item-left">
                    <div className="aod-item-img">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div>
                      <p className="aod-item-name">{item.name}</p>
                      <p className="aod-item-qty">Quantity: {item.qty}</p>
                    </div>
                  </div>
                  <p className="aod-item-price">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="aod-summary">
              <div className="aod-summary-row">
                <span className="aod-summary-label">Subtotal</span>
                <span className="aod-summary-val">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="aod-summary-row">
                <span className="aod-summary-label">Shipping</span>
                <span className="aod-summary-val">₹{shipping.toLocaleString()}</span>
              </div>
              <div className="aod-summary-row aod-total-row">
                <span className="aod-total-label">Total</span>
                <span className="aod-total-val">₹{total.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* ── Right: Customer + Shipping ── */}
          <div className="aod-sidebar">

            {/* Customer Details */}
            <div className="aod-card">
              <h3 className="aod-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Customer Details
              </h3>

              <div className="aod-customer-top">
                <div className="aod-avatar">
                  {normalized.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="aod-customer-name">{normalized.customer.name}</p>
                  <p className="aod-customer-since">Customer since {normalized.customer.since}</p>
                </div>
              </div>

              <div className="aod-contact">
                <p className="aod-contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {normalized.customer.email}
                </p>
                <p className="aod-contact-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l1.93-1.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22.73 15.5v1.42z" />
                  </svg>
                  {normalized.customer.phone}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="aod-card">
              <h3 className="aod-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Shipping Address
              </h3>
              <div className="aod-address">
                <p>{normalized.shipping.line1}</p>
                <p>{normalized.shipping.city}</p>
                <p>{normalized.shipping.country}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Adminlayout>
  );
}

export default AdminOrderDetails;