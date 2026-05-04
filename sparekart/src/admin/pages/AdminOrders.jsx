import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Adminlayout from "./Adminlayout";
import "../css/AdminOrders.css";
import { apiFetch } from "../../data/api";

function AdminOrders() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All Status");
  const [dropOpen, setDropOpen] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/admin/orders");
        const mapped = data.map((o) => ({
          id: o._id,
          customer: o.user?.name || "Customer",
          items: `${o.items.length} item(s)`,
          total: `₹${Number(o.totalAmount || 0).toLocaleString()}`,
          payment: o.paymentMethod,
          status: o.paymentStatus,
          date: new Date(o.createdAt).toISOString().split("T")[0],
        }));
        setAllOrders(mapped);
      } catch {
        setAllOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all order history? This action cannot be undone.")) return;
    try {
      await apiFetch("/admin/orders", { method: "DELETE" });
      setAllOrders([]);
      alert("Order history cleared successfully!");
    } catch (err) {
      alert(err.message || "Failed to clear order history");
    }
  };

  const filterOptions = ["All Status", "Paid", "Pending", "Failed"];

  const filtered = allOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All Status" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = allOrders
    .filter((o) => o.status === "Paid")
    .reduce((sum, o) => sum + parseInt(o.total.replace(/[₹,]/g, "")), 0);

  if (loading) {
    return (
      <Adminlayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", width: "100%" }}>
          <h3>Loading orders...</h3>
        </div>
      </Adminlayout>
    );
  }

  return (
    <Adminlayout>
      <div className="ao-page">

        {/* ── Title ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="ao-title">Manage Orders</h2>
          <button 
            onClick={handleClearHistory}
            style={{ 
              background: "#ff4d4f", 
              color: "#fff", 
              border: "none", 
              padding: "8px 16px", 
              borderRadius: "6px", 
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(255, 77, 79, 0.2)"
            }}
          >
            Clear Order History
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="ao-stats">
          <div className="ao-stat-card">
            <p className="ao-stat-label">Total Orders</p>
            <p className="ao-stat-value">{allOrders.length}</p>
          </div>
          <div className="ao-stat-card">
            <p className="ao-stat-label">Paid Orders</p>
            <p className="ao-stat-value ao-green">{allOrders.filter((o) => o.status === "Paid").length}</p>
          </div>
          <div className="ao-stat-card">
            <p className="ao-stat-label">Pending</p>
            <p className="ao-stat-value ao-orange">{allOrders.filter((o) => o.status === "Pending").length}</p>
          </div>
          <div className="ao-stat-card">
            <p className="ao-stat-label">Total Revenue</p>
            <p className="ao-stat-value ao-blue">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* ── Search + Filter ── */}
        <div className="ao-controls">

          {/* Search */}
          <div className="ao-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter dropdown — same size as search row */}
          <div className="ao-filter-wrap">
            <button
              className="ao-filter-btn"
              onClick={() => setDropOpen((prev) => !prev)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {filter}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropOpen && (
              <div className="ao-dropdown">
                {filterOptions.map((opt) => (
                  <div
                    key={opt}
                    className={`ao-dropdown-item ${filter === opt ? "ao-dropdown-active" : ""}`}
                    onClick={() => { setFilter(opt); setDropOpen(false); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Table ── */}
        <div className="ao-table-card">
          <table className="ao-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ao-empty">No orders found.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="ao-order-id">{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.items}</td>
                    <td>{o.total}</td>
                    <td>{o.payment}</td>
                    <td>
                      <span className={`ao-badge ao-badge-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{o.date}</td>
                    <td>
                      <button
                        className="ao-view-btn"
                        title="View"
                        onClick={() => navigate(`/admin/order/${o.id}`)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Adminlayout>
  );
}

export default AdminOrders;