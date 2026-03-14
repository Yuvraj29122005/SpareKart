import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/ForgotPassword.css";
import logo from "../../images/logo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    alert("Password reset link sent to your email");
  };

  return (
    <div className="page">
      <img src={logo} alt="logo" className="logo" />

      <form className="card" onSubmit={handleSubmit}>
        <h2>Password Reset</h2>
        <p className="sub">Enter Email and reset password</p>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          className={error ? "input-error" : ""}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn">Reset Password</button>

        <p className="loginlink">
          Already have a password? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
