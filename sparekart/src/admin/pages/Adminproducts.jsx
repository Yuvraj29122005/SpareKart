import { useState } from "react";
import Adminlayout from "./Adminlayout";
import "../css/AdminProducts.css";

// ── Static default products (resets on refresh) ──
const defaultProducts = [
  { id: 1, name: "Engine Oil Filter",  category: "Engine",      price: 499,  stock: 50,  img: null, desc: "High-quality oil filter for engine protection." },
  { id: 2, name: "Brake Disc Set",     category: "Brakes",      price: 3500, stock: 30,  img: null, desc: "Premium brake disc set for superior stopping power." },
  { id: 3, name: "All-Season Tyre",    category: "Tyres",       price: 6500, stock: 40,  img: null, desc: "Durable all-season tyre with excellent grip." },
  { id: 4, name: "LED Headlight",      category: "Lights",      price: 1899, stock: 60,  img: null, desc: "Bright LED headlight for better visibility." },
  { id: 5, name: "Car Air Freshener",  category: "Accessories", price: 199,  stock: 100, img: null, desc: "Long-lasting car air freshener with premium fragrance." },
  { id: 6, name: "Spark Plugs Set",    category: "Engine",      price: 799,  stock: 25,  img: null, desc: "High-performance spark plugs for smooth engine running." },
  { id: 7, name: "Brake Pads",         category: "Brakes",      price: 1299, stock: 45,  img: null, desc: "Premium brake pads for safe and reliable braking." },
  { id: 8, name: "Fog Light Set",      category: "Lights",      price: 1599, stock: 60,  img: null, desc: "Powerful fog lights for low-visibility conditions." },
];

const emptyForm = {
  name: "", category: "Engine", price: "", stock: "", img: null, imgPreview: null, desc: "",
};

const categories = ["Engine", "Brakes", "Tyres", "Lights", "Accessories"];

function AdminProducts() {
  const [products, setProducts] = useState(defaultProducts);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState("list"); // "list" | "add" | "edit"
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [errors, setErrors]     = useState({});

  // ── Filtered list ──
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handle input change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Handle image pick ──
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, img: url, imgPreview: url }));
  };

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name  = "Product name is required";
    if (!form.price || form.price <= 0) e.price = "Enter a valid price";
    if (!form.stock || form.stock < 0)  e.stock = "Enter a valid stock quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Add product ──
  const handleAdd = () => {
    if (!validate()) return;
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
    const newProduct = {
      id:       maxId + 1,
      name:     form.name.trim(),
      category: form.category,
      price:    parseFloat(form.price),
      stock:    parseInt(form.stock),
      img:      form.img,
      desc:     form.desc.trim(),
    };
    setProducts((prev) => [...prev, newProduct]);
    setForm(emptyForm);
    setView("list");
  };

  // ── Open edit ──
  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      name:       product.name,
      category:   product.category,
      price:      String(product.price),
      stock:      String(product.stock),
      img:        product.img,
      imgPreview: product.img,
      desc:       product.desc || "",
    });
    setErrors({});
    setView("edit");
  };

  // ── Update product ──
  const handleUpdate = () => {
    if (!validate()) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editId
          ? { ...p, name: form.name.trim(), category: form.category, price: parseFloat(form.price), stock: parseInt(form.stock), img: form.img || p.img, desc: form.desc.trim() }
          : p
      )
    );
    setView("list");
    setEditId(null);
    setForm(emptyForm);
  };

  // ── Delete product ──
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // ── Cancel ──
  const handleCancel = () => {
    setForm(emptyForm);
    setErrors({});
    setEditId(null);
    setView("list");
  };

  // ═══════════════════════════════════════
  // VIEW: ADD PRODUCT
  // ═══════════════════════════════════════
  if (view === "add") {
    return (
      <Adminlayout>
        <div className="ap-page">
          <div className="ap-form-header">
            <h2 className="ap-title">Add New Product</h2>
            <p className="ap-subtitle">Fill in the details to add a new spare part to your inventory</p>
          </div>

          <div className="ap-form-card">

            <div className="ap-field">
              <label className="ap-label">🛡 Product Name *</label>
              <input
                className={`ap-input ${errors.name ? "ap-input-err" : ""}`}
                name="name"
                placeholder="e.g., Engine Oil Filter"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="ap-error">{errors.name}</p>}
            </div>

            <div className="ap-field">
              <label className="ap-label">🏷 Category *</label>
              <select className="ap-input" name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="ap-row">
              <div className="ap-field">
                <label className="ap-label">$ Price (₹) *</label>
                <input
                  className={`ap-input ${errors.price ? "ap-input-err" : ""}`}
                  name="price"
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <p className="ap-error">{errors.price}</p>}
              </div>
              <div className="ap-field">
                <label className="ap-label">📊 Stock Quantity *</label>
                <input
                  className={`ap-input ${errors.stock ? "ap-input-err" : ""}`}
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                />
                {errors.stock && <p className="ap-error">{errors.stock}</p>}
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label">🖼 Product Image (choose local file)</label>
              <div className="ap-file-box">
                <input type="file" accept="image/*" onChange={handleImage} />
              </div>
              <p className="ap-hint">Select a file from your device. Stored locally without reloading.</p>
            </div>

            <div className="ap-field">
              <label className="ap-label">Description</label>
              <textarea
                className="ap-textarea"
                name="desc"
                placeholder="Enter product description, specifications, etc."
                value={form.desc}
                onChange={handleChange}
              />
            </div>

            <div className="ap-btn-row">
              <button className="ap-btn-blue" onClick={handleAdd}>Add Product</button>
              <button className="ap-btn-white" onClick={handleCancel}>Cancel</button>
            </div>

          </div>
        </div>
      </Adminlayout>
    );
  }

  // ═══════════════════════════════════════
  // VIEW: EDIT PRODUCT
  // ═══════════════════════════════════════
  if (view === "edit") {
    return (
      <Adminlayout>
        <div className="ap-page">
          <div className="ap-form-header">
            <h2 className="ap-title">Edit Product</h2>
            <p className="ap-subtitle">Fill in the details to update the spare part in your inventory</p>
          </div>

          <div className="ap-form-card">

            <div className="ap-field">
              <label className="ap-label">🛡 Product Name *</label>
              <input
                className={`ap-input ${errors.name ? "ap-input-err" : ""}`}
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="ap-error">{errors.name}</p>}
            </div>

            <div className="ap-field">
              <label className="ap-label">🏷 Category *</label>
              <select className="ap-input" name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="ap-row">
              <div className="ap-field">
                <label className="ap-label">$ Price (₹) *</label>
                <input
                  className={`ap-input ${errors.price ? "ap-input-err" : ""}`}
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                />
                {errors.price && <p className="ap-error">{errors.price}</p>}
              </div>
              <div className="ap-field">
                <label className="ap-label">📊 Stock Quantity *</label>
                <input
                  className={`ap-input ${errors.stock ? "ap-input-err" : ""}`}
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                />
                {errors.stock && <p className="ap-error">{errors.stock}</p>}
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label">🖼 Product Image (choose local file)</label>
              <div className="ap-file-box ap-file-edit">
                {form.imgPreview && (
                  <img src={form.imgPreview} alt="preview" className="ap-img-thumb" />
                )}
                {!form.imgPreview && <div className="ap-part-box">Part</div>}
                <input type="file" accept="image/*" onChange={handleImage} />
              </div>
              <p className="ap-hint">Leave empty to keep the existing image</p>
            </div>

            <div className="ap-field">
              <label className="ap-label">Description</label>
              <textarea
                className="ap-textarea"
                name="desc"
                placeholder="Enter product description, specifications, etc."
                value={form.desc}
                onChange={handleChange}
              />
            </div>

            <div className="ap-btn-row">
              <button className="ap-btn-blue" onClick={handleUpdate}>Update Product</button>
              <button className="ap-btn-white" onClick={handleCancel}>Cancel</button>
            </div>

          </div>
        </div>
      </Adminlayout>
    );
  }

  // ═══════════════════════════════════════
  // VIEW: PRODUCT LIST
  // ═══════════════════════════════════════
  return (
    <Adminlayout>
      <div className="ap-page">

        {/* ── Top Bar ── */}
        <div className="ap-topbar">
          <div>
            <h2 className="ap-title">Manage Products</h2>
            <p className="ap-subtitle">View and update your store inventory.</p>
          </div>
          <div className="ap-topbar-right">
            <div className="ap-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="ap-btn-blue ap-add-btn"
              onClick={() => { setForm(emptyForm); setErrors({}); setView("add"); }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="ap-table-card">
          <table className="ap-table">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="ap-empty">No products found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="ap-thumb">
                        {p.img ? <img src={p.img} alt={p.name} /> : <span>Part</span>}
                      </div>
                    </td>
                    <td className="ap-name">{p.name}</td>
                    <td>
                      <span className={`ap-badge ap-cat-${p.category.toLowerCase()}`}>{p.category}</span>
                    </td>
                    <td className="ap-price-col">₹{p.price.toLocaleString()}</td>
                    <td>
                      <span className={`ap-stock ${p.stock >= 50 ? "ap-stock-green" : p.stock >= 20 ? "ap-stock-orange" : "ap-stock-red"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <div className="ap-actions">
                        <button className="ap-edit-btn" title="Edit" onClick={() => openEdit(p)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="ap-del-btn" title="Delete" onClick={() => handleDelete(p.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Adminlayout>
  );
}

export default AdminProducts;