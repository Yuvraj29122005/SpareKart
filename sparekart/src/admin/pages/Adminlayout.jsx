import { NavLink, useNavigate } from "react-router-dom";
import "../css/Adminlayout.css";
import logo from "../../images/logo.png"; // adjust path if needed
import { clearStoredAuth, setAdminLogin, clearAllCache } from "../../data/api";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  const links = [
    { 
      to: "/admin/dashboard", 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>, 
      label: "Dashboard" 
    },
    { 
      to: "/admin/products",  
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>, 
      label: "Products"  
    },
    { 
      to: "/admin/orders",    
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, 
      label: "Orders"    
    },
    { 
      to: "/admin/users",     
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, 
      label: "Users"     
    },
    { 
      to: "/admin/feedback",  
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, 
      label: "Feedback"  
    },
    { 
      to: "/admin/profile",   
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, 
      label: "Profile"   
    },
  ];

  const handleLogout = () => {
    clearAllCache(); // ✅ wipe cached data
    clearStoredAuth();
    setAdminLogin(false);
    navigate("/login");
  };

  return (
    <div className="admin-shell">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-logo">
          <img src={logo} alt="SpareKart" className="admin-logo-img" />
          <div>
            <p className="admin-logo-name">Sparekart</p>
            <p className="admin-logo-sub">Admin Panel</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="admin-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "admin-nav-link active" : "admin-nav-link"
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
          
          <button className="admin-nav-link logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">
        {children}
      </main>

    </div>
  );
}

export default AdminLayout;