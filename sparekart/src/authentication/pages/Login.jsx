import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import logo from "../../images/logo.png";
import { apiFetch, setAdminLogin, setStoredAuth, clearAllCache } from "../../data/api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");



  const validate = () => {
    const e = {};

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    if (!form.password.trim()) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    try {
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      
      clearAllCache(); // ✅ wipe any cached data from previous session
      setStoredAuth(data);

      // Check if the user is an admin from the database response
      if (data.user && (data.user.role === "admin" || data.user.role === "Admin")) {
        setAdminLogin(true);
        navigate("/admin/dashboard");
      } else {
        setAdminLogin(false);
        navigate("/home");
      }
    } catch (err) {
      setFormError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <img src={logo} alt="logo" className="top-logo" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="circle-icon">➜</div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        {formError && <p className="error">{formError}</p>}

        <label>Email</label>
        <input
          className={errors.email ? "input-error" : ""}
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label>Password</label>
        <input
          type="password"
          className={errors.password ? "input-error" : ""}
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <div className="forgot">
          <Link to="/forgot">Forgot Password?</Link>
        </div>

        <button className="login-btn">Login</button>

        <p className="register">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
