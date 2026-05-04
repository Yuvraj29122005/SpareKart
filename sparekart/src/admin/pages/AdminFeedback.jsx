import { useEffect, useState } from "react";
import Adminlayout from "./Adminlayout";
import "../css/AdminFeedback.css";
import { apiFetch } from "../../data/api";

function AdminFeedback() {
  const [search, setSearch] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/feedback");
        const mapped = data.map((f) => ({
          id: f._id,
          name: f.name,
          email: f.email,
          date: new Date(f.createdAt).toISOString().split("T")[0],
          message: f.message
        }));
        setFeedbackList(mapped);
      } catch {
        setFeedbackList([]);
      }
    };
    load();
  }, []);

  const filtered = feedbackList.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Adminlayout>
      <div className="af-page">

        {/* ── Title ── */}
        <h2 className="af-title">User Feedback</h2>

        {/* ── Stat Cards ── */}
        <div className="af-stats">
          <div className="af-stat-card">
            <p className="af-stat-label">Total Feedback</p>
            <p className="af-stat-value">{feedbackList.length}</p>
          </div>
          <div className="af-stat-card">
            <p className="af-stat-label">This Week</p>
            <p className="af-stat-value af-blue">0</p>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="af-search-wrap">
          <svg className="af-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="af-search-input"
            placeholder="Search feedback by name, email or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Feedback Grid ── */}
        {filtered.length === 0 ? (
          <p className="af-empty">No feedback found.</p>
        ) : (
          <div className="af-grid">
            {filtered.map((fb) => (
              <div className="af-card" key={fb.id}>

                {/* Card Top: avatar + user info */}
                <div className="af-card-top">
                  <div className="af-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>

                  <div className="af-user-info">
                    <p className="af-name">{fb.name}</p>
                    <p className="af-meta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {fb.email}
                    </p>
                    <p className="af-meta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {fb.date}
                    </p>
                  </div>
                </div>

                {/* Message Box */}
                <div className="af-message-box">
                  <p className="af-message-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Feedback
                  </p>
                  <p className="af-message-text">{fb.message}</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </Adminlayout>
  );
}

export default AdminFeedback;