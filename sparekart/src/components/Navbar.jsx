import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import userImg from "../images/user.png";
import "./layout.css";
import { apiFetch, getStoredAuth } from "../data/api";

function Navbar() {

  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "User", avatar: userImg });
  const [authToken, setAuthToken] = useState(() => getStoredAuth()?.token || null);

  // Poll for auth token changes (login / logout / register)
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

  // Re-fetch user profile whenever the token changes
  useEffect(() => {
    if (!authToken) {
      setUser({ name: "User", avatar: userImg });
      return;
    }
    const loadUser = async () => {
      try {
        const data = await apiFetch("/users/me");
        setUser({
          name: data.name || "User",
          avatar: data.avatar || userImg
        });
      } catch (err) {
        // Not logged in or fetch failed
        setUser({ name: "User", avatar: userImg });
      }
    };
    loadUser();
  }, [authToken]);

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

      {/* RIGHT SECTION */}
      <div className="nav-right">

        {/* CART */}
        <span
          className="cart"
          onClick={() => navigate("/cart")}
        >
          🛒
        </span>

        {/* PROFILE */}
        <div
          className="profile-mini"
          onClick={() => navigate("/profile")}
        >
          <img src={user.avatar} alt="user" className="mini-img"/>
          <span>Hi {user.name.split(" ")[0]}!</span>
        </div>

      </div>

    </div>
  );
}

export default Navbar;
