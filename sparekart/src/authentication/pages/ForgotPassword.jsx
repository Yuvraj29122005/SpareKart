import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/ForgotPassword.css";
import logo from "../../images/logo.png";
import { apiFetch } from "../../data/api";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
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
    setSuccessMsg("");

    try {
      const data = await apiFetch("/users/forgot-password-otp", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setSuccessMsg(data.message || "OTP sent to your email");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSuccessMsg("");

    try {
      const data = await apiFetch("/users/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword })
      });
      setSuccessMsg(data.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Invalid OTP or failed to reset password");
    }
  };

  return (
    <div className="page">
      <img src={logo} alt="logo" className="logo" />

      <div className="card">
        <h2>Password Reset</h2>
        <p className="sub">
          {step === 1 ? "Enter Email and receive OTP" : "Enter OTP and your new password"}
        </p>

        {error && <p className="error">{error}</p>}
        {successMsg && <p style={{ color: "green", fontSize: "14px", marginBottom: "10px" }}>{successMsg}</p>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              className={error && error.toLowerCase().includes('email') ? "input-error" : ""}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className="btn">Update Password</button>
          </form>
        )}

        <p className="loginlink">
          Already have a password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
