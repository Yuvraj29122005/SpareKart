import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import userImg from "../images/user.png";
import "./layout.css";
import "./profileNavbar.css";
import { clearAllCache } from "../data/api";

function ProfileNavbar({ activeUser }) {
  const navigate = useNavigate();

  // We use the activeUser prop passed from the Profile page parent if available, 
  // ensuring the navbar instantly reflects any new saved changes.
  const displayUser = activeUser || { name: "User", avatar: userImg };

  const handleLogout = () => {
    clearAllCache(); // ✅ wipe all cached API data so next user starts fresh
    localStorage.removeItem("sparekart_auth");
    navigate("/login");
  };

  return (
    <div className="navbar">
      {/* LEFT LOGO */}
      <div className="nav-left">
        <Link to="/home">
          <img src={logo} alt="logo" className="nav-logo" />
        </Link>
      </div>

      {/* CENTER TITLE */}
      <div className="nav-center">
        <Link to="/home" className="brand-link">
          <span className="spare-text">Spare</span>
          <span className="kart-text">Kart</span>
        </Link>
      </div>

      {/* RIGHT SECTION WITH LOGOUT */}
      <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* PROFILE
        <div className="profile-mini" onClick={() => navigate("/profile")}>
          <img src={displayUser.avatar || displayUser.image || userImg} alt="user" className="mini-img"/>
          <span>Hi {displayUser.name ? displayUser.name.split(" ")[0] : "User"}!</span>
        </div> */}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileNavbar;
