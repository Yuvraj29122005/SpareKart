import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./Adminlayout";
import "../css/Admindashboard.css";
import { apiFetch } from "../../data/api";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await apiFetch("/admin/dashboard");
        setData(stats);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Products",
        value: data?.products ?? 0,
        sub: `${data?.lowStock?.length ?? 0} low stock`,
        icon: "📦",
        color: "#4f46e5",
        bg: "#ede9fe"
      },
      {
        label: "Total Orders",
        value: data?.orders ?? 0,
        sub: `${data?.paidOrders ?? 0} paid`,
        icon: "🧾",
        color: "#16a34a",
        bg: "#dcfce7"
      },
      {
        label: "Total Users",
        value: data?.users ?? 0,
        sub: `${data?.users ?? 0} active`,
        icon: "👥",
        color: "#9333ea",
        bg: "#f3e8ff"
      },
      {
        label: "Total Revenue",
        value: `₹${Number(data?.totalRevenue ?? 0).toLocaleString()}`,
        sub: "From paid orders",
        icon: "💰",
        color: "#ea580c",
        bg: "#ffedd5"
      }
    ],
    [data]
  );

  const orderStatus = [
    { label: "Paid", count: data?.paidOrders ?? 0, color: "#16a34a" },
    { label: "Pending", count: data?.pendingOrders ?? 0, color: "#f59e0b" }
  ];

  const categoryData = data?.categoryBreakdown || [];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", width: "100%" }}>
          <h3>Loading dashboard data...</h3>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* ── Page Header ── */}
      <div className="dash-header">
        <h2 className="dash-title">Dashboard</h2>
        <p className="dash-sub">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-text">
              <p className="stat-label">{s.label}</p>
              <h3 className="stat-value">{s.value}</h3>
              <p className="stat-sub">{s.sub}</p>
            </div>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div className="dash-bottom">

        {/* Low Stock Alert */}
        <div className="dash-card low-stock-card">
          <h4 className="card-title">⚠ Low Stock Alert</h4>
          
          {(data?.lowStock?.length ?? 0) > 0 ? (
            <div className="low-stock-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.lowStock.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#991b1b', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontWeight: '600' }}>{item.name}</span>
                     <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{item.category}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{item.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="low-stock-empty">
              <span className="low-stock-icon">✅</span>
              <p>All products well stocked!</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="dash-right-col">

          {/* Order Status */}
          <div className="dash-card">
            <h4 className="card-title">Order Status</h4>
            <div className="order-status-list">
              {orderStatus.map((o, i) => (
                <div className="order-status-row" key={i}>
                  <div className="order-status-left">
                    <span className="order-dot" style={{ background: o.color }} />
                    <span className="order-status-label">{o.label}</span>
                  </div>
                  <span className="order-status-count">{o.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Category */}
          <div className="dash-card">
            <h4 className="card-title">Products by Category</h4>
            <div className="category-list">
              {categoryData.map((c, i) => (
                <div className="category-row" key={i}>
                  <span className="category-label">{c.label}</span>
                  <span className="category-count">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;