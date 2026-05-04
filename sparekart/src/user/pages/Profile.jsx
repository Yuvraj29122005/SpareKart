import ProfileNavbar from "../../components/ProfileNavbar";
import Footer from "../../components/Footer";
import "../css/Profile.css";
import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../../data/api";
import userImg from "../../images/user.png";

function Profile() {
    const [edit, setEdit] = useState(false);     // controls view vs edit mode on right panel
    const fileRef = useRef(null);                // used to trigger hidden <input type="file" />

    const defaultUser = {
        name: "",
        email: "",
        phone: "",
        address: "",
        image: userImg,
    };

    const [user, setUser] = useState(defaultUser);
    const [form, setForm] = useState({ ...defaultUser });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const data = await apiFetch("/users/me");
                const profileData = {
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    image: data.avatar || userImg,
                };
                setUser(profileData);
                setForm(profileData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    const validate = () => {
        let e = {};
        if (!form.name.trim()) e.name = "Full name is required";
        if (!form.phone.trim()) e.phone = "Phone number is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleEdit = () => {
        setForm({ ...user });
        setErrors({});
        setEdit(true);
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            const data = await apiFetch("/users/me", {
                method: "PUT",
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                    avatar: form.image !== userImg ? form.image : ""
                })
            });
            const profileData = {
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                image: data.avatar || userImg,
            };
            setUser(profileData);
            setEdit(false);
        } catch (err) {
            alert(err.message || "Failed to update profile");
        }
    };

    const handleCancel = () => {
        setForm({ ...user });
        setErrors({});
        setEdit(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setForm((prev) => ({ ...prev, image: reader.result }));
            };
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <>
            <ProfileNavbar activeUser={user} />

            <div className="profile-page">
                <h2 className="profile-title">My Profile</h2>

                <div className="profile-grid">

                    {/* ── LEFT PANEL ── */}
                    <div className="profile-left">
                        <div className="profile-card">

                            {/* Avatar */}
                            <div className="avatar-wrap">
                                <img
                                    src={edit ? form.image : user.image}
                                    alt="profile"
                                    className="profile-img"
                                />
                                {edit && (
                                    <>
                                        <button
                                            className="change-photo-btn"
                                            onClick={() => fileRef.current.click()}
                                        >
                                            Change Photo
                                        </button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={fileRef}
                                            style={{ display: "none" }}
                                            onChange={handleImageChange}
                                        />
                                    </>
                                )}
                            </div>

                            <h3 className="profile-name">{user.name}</h3>
                            <p className="profile-email">{user.email}</p>
                            <span className="active-tag">● Active Member</span>

                            <div className="profile-phone">
                                <span className="profile-phone-icon">📞</span>
                                {user.phone}
                            </div>

                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="info-card">

                        <div className="info-header">
                            <h3 className="info-title">Personal Information</h3>
                            {!edit && (
                                <button className="edit-btn" onClick={handleEdit}>
                                    ✏ Edit Profile
                                </button>
                            )}
                        </div>

                        {/* ── VIEW MODE ── */}
                        {!edit ? (
                            <div className="view-fields">

                                <div className="view-field">
                                    <label className="field-label">
                                        <span className="field-icon">👤</span> Full Name
                                    </label>
                                    <div className="field-box">{user.name}</div>
                                </div>

                                <div className="view-field">
                                    <label className="field-label">
                                        <span className="field-icon">✉</span> Email Address
                                    </label>
                                    <div className="field-box">{user.email}</div>
                                </div>

                                <div className="view-field">
                                    <label className="field-label">
                                        <span className="field-icon">📞</span> Phone Number
                                    </label>
                                    <div className="field-box">{user.phone}</div>
                                </div>

                            </div>
                        ) : (

                            /* ── EDIT MODE ── */
                            <div className="edit-fields">



                                <div className="edit-field">
                                    <label className="field-label">Full Name</label>
                                    <div className={`input-wrap ${errors.name ? "wrap-error" : ""}`}>
                                        <span className="input-icon">👤</span>
                                        <input
                                            className="edit-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    {errors.name && <p className="field-error">{errors.name}</p>}
                                </div>

                                <div className="edit-field">
                                    <label className="field-label">Email Address</label>
                                    <div className="input-wrap input-disabled">
                                        <span className="input-icon">✉</span>
                                        <input
                                            className="edit-input"
                                            value={form.email}
                                            disabled
                                        />
                                    </div>
                                    <p className="field-hint">Email cannot be changed</p>
                                </div>

                                <div className="edit-field">
                                    <label className="field-label">Phone Number</label>
                                    <div className={`input-wrap ${errors.phone ? "wrap-error" : ""}`}>
                                        <span className="input-icon">📞</span>
                                        <input
                                            className="edit-input"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                    {errors.phone && <p className="field-error">{errors.phone}</p>}
                                </div>

                                <div className="edit-btn-row">
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                                </div>

                            </div>
                        )}

                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}

export default Profile;