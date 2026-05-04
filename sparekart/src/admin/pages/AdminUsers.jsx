import { useState, useEffect, useRef } from "react";
import Adminlayout from "./Adminlayout";
import "../css/AdminUsers.css";
import { apiFetch } from "../../data/api";

const filterOptions = ["All Status", "Active", "Inactive", "Blocked"];

function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All Status");
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionMenu, setActionMenu] = useState(null); // user id whose menu is open
  const [loading, setLoading] = useState(true);

  const menuRef = useRef(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/admin/users");
        setUsers(
          data.map((u) => ({
            ...u,
            totalSpent: `₹${Number(u.totalSpent || 0).toLocaleString()}`
          }))
        );
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Block user — sets status to Blocked
  const handleBlock = async (id) => {
    try {
      await apiFetch(`/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "Blocked" })
      });
      setUsers((prev) =>
        prev.map((u) => u.id === id ? { ...u, status: "Blocked" } : u)
      );
    } catch (e) {
      alert("Failed to block user");
    }
    setActionMenu(null);
  };

  // Activate user — sets status to Active
  const handleActivate = async (id) => {
    try {
      await apiFetch(`/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "Active" })
      });
      setUsers((prev) =>
        prev.map((u) => u.id === id ? { ...u, status: "Active" } : u)
      );
    } catch (e) {
      alert("Failed to activate user");
    }
    setActionMenu(null);
  };

  // Remove user
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this user? This cannot be undone.")) return;
    try {
      await apiFetch(`/admin/users/${id}`, {
        method: "DELETE"
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert("Failed to remove user");
    }
    setActionMenu(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);
    const matchFilter = filter === "All Status" || u.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <Adminlayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", width: "100%" }}>
          <h3>Loading users...</h3>
        </div>
      </Adminlayout>
    );
  }

  return (
    <Adminlayout>
      <div className="au-page">

        {/* ── Title ── */}
        <h2 className="au-title">Manage Users</h2>

        {/* ── Stat Cards ── */}
        <div className="au-stats">
          <div className="au-stat-card">
            <p className="au-stat-label">Total Users</p>
            <p className="au-stat-value">{users.length}</p>
          </div>
          <div className="au-stat-card">
            <p className="au-stat-label">Active Users</p>
            <p className="au-stat-value au-green">{users.filter((u) => u.status === "Active").length}</p>
          </div>
          <div className="au-stat-card">
            <p className="au-stat-label">Blocked Users</p>
            <p className="au-stat-value au-red">{users.filter((u) => u.status === "Inactive" || u.status === "Blocked").length}</p>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="au-controls">

          {/* Search */}
          <div className="au-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="au-filter-wrap">
            <button className="au-filter-btn" onClick={() => setFilterOpen((p) => !p)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {filter}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {filterOpen && (
              <div className="au-dropdown">
                {filterOptions.map((opt) => (
                  <div
                    key={opt}
                    className={`au-dropdown-item ${filter === opt ? "au-dropdown-active" : ""}`}
                    onClick={() => { setFilter(opt); setFilterOpen(false); }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Table ── */}
        <div className="au-table-card">
          <table className="au-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>CONTACT</th>
                <th>ORDERS</th>
                <th>TOTAL SPENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="au-empty">No users found.</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>

                    {/* User */}
                    <td>
                      <div className="au-user-cell">
                        <div className="au-avatar">{u.name.charAt(0)}</div>
                        <span className="au-name">{u.name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="au-contact">
                        <span className="au-contact-row">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {u.email}
                        </span>
                        <span className="au-contact-row">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l1.93-1.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22.73 15.5v1.42z" />
                          </svg>
                          {u.phone}
                        </span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td>{u.orders}</td>

                    {/* Total Spent */}
                    <td>{u.totalSpent}</td>

                    {/* Status Badge */}
                    <td>
                      <span className={`au-badge au-badge-${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Action Button with dropdown */}
                    <td>
                      <div className="au-action-wrap" ref={actionMenu === u.id ? menuRef : null}>
                        <button
                          className="au-action-btn"
                          onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                        >
                          {u.status}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {/* Popup menu */}
                        {actionMenu === u.id && (
                          <div className="au-action-menu">
                            {u.status !== "Active" ? (
                              <button
                                className="au-menu-item au-menu-active"
                                onClick={() => handleActivate(u.id)}
                              >
                                ✅ Activate User
                              </button>
                            ) : (
                              <button
                                className="au-menu-item au-menu-block"
                                onClick={() => handleBlock(u.id)}
                              >
                                🚫 Block User
                              </button>
                            )}
                            <button
                              className="au-menu-item au-menu-remove"
                              onClick={() => handleRemove(u.id)}
                            >
                              🗑 Remove User
                            </button>
                          </div>
                        )}
                      </div>
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

export default AdminUsers;