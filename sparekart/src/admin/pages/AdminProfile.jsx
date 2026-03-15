import React, { useState, useRef } from "react";
import AdminLayout from "./Adminlayout";
import "../css/AdminProfile.css";
import userImg from "../../images/user.png";

function AdminProfile() {
  const [edit, setEdit] = useState(false);
  const fileRef = useRef(null);

  // Default user — resets on refresh (fully static)
  const defaultAdmin = {
    name: "Admin",
    email: "admin@carparts.com",
    phone: "+91 9876543210",
    address: "rk university,rajkot,gujarat,360020",
    image: userImg,
  };

  const [admin, setAdmin] = useState(defaultAdmin);
  const [form, setForm] = useState({ ...defaultAdmin }); // separate edit copy
  const [errors, setErrors] = useState({});

  // Validate edit form
  const validate = () => {
    let e = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.phone.trim())   e.phone   = "Phone number is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = () => {
    setForm({ ...admin }); // copy current admin into form
    setErrors({});
    setEdit(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    setAdmin({ ...form });  // save form back to admin
    setEdit(false);
  };

  // Profile photo change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, image: url }));
      // Also update display immediately if we want it to react like the screenshot
      if (!edit) {
        setAdmin((prev) => ({ ...prev, image: url }));
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-profile-page">
        <h2 className="admin-profile-title">Admin Profile</h2>

        <div className="admin-profile-grid">

          {/* ── LEFT PANEL ── */}
          <div className="admin-profile-left">
            <div className="admin-profile-card">

              {/* Avatar */}
              <div className="admin-avatar-wrap">
                <img
                  src={edit ? form.image : admin.image}
                  alt="profile"
                  className="admin-profile-img"
                />
                
                <button
                  className="admin-change-photo-btn"
                  onClick={() => fileRef.current.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                  
              </div>

              <h3 className="admin-profile-name">{admin.name}</h3>
              <p className="admin-profile-email">{admin.email}</p>
              <span className="admin-role-tag">Administrator</span>

            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="admin-info-card">

            <div className="admin-info-header">
              <h3 className="admin-info-title">Personal Information</h3>
              {!edit && (
                <button className="admin-edit-btn" onClick={handleEdit}>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {/* ── VIEW MODE ── */}
            {!edit ? (
              <div className="admin-view-fields">

                <div className="admin-view-field">
                  <label className="admin-field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Full Name
                  </label>
                  <div className="admin-field-box">{admin.name}</div>
                </div>

                <div className="admin-view-field">
                  <label className="admin-field-label">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    Email Address
                  </label>
                  <div className="admin-field-box">{admin.email}</div>
                </div>

                <div className="admin-view-field">
                  <label className="admin-field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Phone Number
                  </label>
                  <div className="admin-field-box">{admin.phone}</div>
                </div>

                <div className="admin-view-field">
                  <label className="admin-field-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Address
                  </label>
                  <div className="admin-field-box">{admin.address}</div>
                </div>

              </div>
            ) : (

              /* ── EDIT MODE ── */
              <div className="admin-edit-fields">

                <div className="admin-edit-field">
                  <label className="admin-field-label light">Full Name</label>
                  <div className={`admin-input-wrap ${errors.name ? "wrap-error" : ""}`}>
                    <span className="admin-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input
                      className="admin-edit-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full Name"
                    />
                  </div>
                  {errors.name && <p className="admin-field-error">{errors.name}</p>}
                </div>

                <div className="admin-edit-field">
                  <label className="admin-field-label light">Email Address</label>
                  <div className="admin-input-wrap admin-input-disabled">
                    <span className="admin-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      className="admin-edit-input"
                      value={form.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="admin-edit-field">
                  <label className="admin-field-label light">Phone Number</label>
                  <div className={`admin-input-wrap ${errors.phone ? "wrap-error" : ""}`}>
                    <span className="admin-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <input
                      className="admin-edit-input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                  {errors.phone && <p className="admin-field-error">{errors.phone}</p>}
                </div>

                <div className="admin-edit-field">
                  <label className="admin-field-label light">Address</label>
                  <div className={`admin-input-wrap textarea-wrap ${errors.address ? "wrap-error" : ""}`}>
                    <span className="admin-input-icon flex-start-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                       <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </span>
                    <textarea
                      className="admin-edit-input admin-textarea"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Address"
                    ></textarea>
                  </div>
                  {errors.address && <p className="admin-field-error">{errors.address}</p>}
                </div>

                <div className="admin-edit-btn-row">
                  <button className="admin-save-btn" onClick={handleSave}>Save Changes</button>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
