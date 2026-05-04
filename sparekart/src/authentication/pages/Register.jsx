import React, { useState, useRef, useEffect } from "react";
import "../css/Register.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/logo.png";
import { apiFetch, setStoredAuth, clearAllCache } from "../../data/api";

function Register() {
  const navigate = useNavigate();

  /* ─── State ─── */
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  /* ─── Countdown timer for resend ─── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ─── Form field change ─── */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ─── Validate registration form ─── */
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

  /* ─── STEP 1: Submit form → Send OTP ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await apiFetch("/users/send-otp", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setFormError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ─── OTP input handlers ─── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // single digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => !d);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  /* ─── STEP 2: Verify OTP ─── */
  const handleVerifyOtp = async () => {
    setFormError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setFormError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch("/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      clearAllCache(); // ✅ wipe any cached data before logging in as new user
      setStoredAuth(data);  // auto-login: store token returned by server
      navigate("/home");    // go directly to home, no need to re-login
    } catch (err) {
      setFormError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Resend OTP ─── */
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setFormError("");
    setLoading(true);
    try {
      await apiFetch("/users/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      setFormError("");
    } catch (err) {
      setFormError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ─── RENDER ─── */
  return (
    <div className="page">
      <img src={logo} alt="logo" className="logo" />

      {step === 1 ? (
        /* ─── Registration Form ─── */
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

          <button className="btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Sending OTP...
              </span>
            ) : (
              "Register"
            )}
          </button>

          <p className="loginlink">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      ) : (
        /* ─── OTP Verification Card ─── */
        <div className="card otp-card">
          <div className="otp-icon">✉️</div>
          <h2>Verify Your Email</h2>
          <p className="sub">
            We've sent a 6-digit code to<br />
            <strong className="otp-email">{form.email}</strong>
          </p>

          {formError && <p className="error">{formError}</p>}

          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${digit ? "filled" : ""}`}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            className="btn"
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Verifying...
              </span>
            ) : (
              "Verify & Create Account"
            )}
          </button>

          <div className="otp-footer">
            <p className="otp-timer">
              {countdown > 0
                ? `Resend OTP in ${countdown}s`
                : "Didn't receive the code?"}
            </p>
            <button
              type="button"
              className={`resend-btn ${countdown > 0 ? "disabled" : ""}`}
              onClick={handleResendOtp}
              disabled={countdown > 0 || loading}
            >
              Resend OTP
            </button>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setStep(1);
              setOtp(["", "", "", "", "", ""]);
              setFormError("");
            }}
          >
            ← Back to Registration
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;
