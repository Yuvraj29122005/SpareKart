import React, { useState } from "react";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Full name is required";
    } else if (form.name.trim().length < 3) {
      e.name = "Full name must be at least 3 characters";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid 10 digit phone number";
    }

    if (!form.password.trim()) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    if (!form.confirm.trim()) {
      e.confirm = "Please confirm your password";
    } else if (form.password !== form.confirm) {
      e.confirm = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    alert("Registration Successful");
    navigate("/login");
  };

  return (
    <div className="page">
      {/* Logo */}
      <img src={logo} alt="logo" className="logo" />

      <form className="card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="sub">Join Car Spare Hub today</p>

        {formError && <p className="error">{formError}</p>}

        <input
          name="name"
          className={errors.name ? "input-error" : ""}
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="field-error">{errors.name}</p>}

        <input
          name="email"
          className={errors.email ? "input-error" : ""}
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <input
          name="phone"
          className={errors.phone ? "input-error" : ""}
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="field-error">{errors.phone}</p>}

        <input
          name="password"
          type="password"
          className={errors.password ? "input-error" : ""}
          placeholder="Create password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <input
          name="confirm"
          type="password"
          className={errors.confirm ? "input-error" : ""}
          placeholder="Confirm password"
          value={form.confirm}
          onChange={handleChange}
        />
        {errors.confirm && <p className="field-error">{errors.confirm}</p>}

        <button className="btn">Register</button>

        <p className="loginlink">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
