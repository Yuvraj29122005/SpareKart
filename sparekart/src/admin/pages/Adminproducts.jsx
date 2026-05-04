import { useEffect, useState } from "react";
import Adminlayout from "./Adminlayout";
import "../css/AdminProducts.css";
import { apiFetch } from "../../data/api";

const emptyForm = {
  name: "", category: "Engine", price: "", stock: "", img: "", desc: "",
};

const categories = ["Engine", "Brakes", "Tyres", "Lights", "Accessories"];

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState("list"); // "list" | "add" | "edit"
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(true);

  const loadProducts = async () => {
    try {
      const data = await apiFetch("/products");
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
    apiFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        img: form.img || "",
        desc: form.desc.trim() || "No description",
      })
    }).then(async () => {
      setForm(emptyForm);
      setView("list");
      await loadProducts();
    });
  };

  // ── Open edit ──
  const openEdit = (product) => {
    setEditId(product._id);
    setForm({
      name:       product.name,
      category:   product.category,
      price:      String(product.price),
      stock:      String(product.stock),
      img:        product.img || "",
      desc:       product.desc || "",
    });
    setErrors({});
    setView("edit");
  };

  // ── Update product ──
  const handleUpdate = () => {
    if (!validate()) return;
    apiFetch(`/products/${editId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        img: form.img || "",
        desc: form.desc.trim() || "No description",
      })
    }).then(async () => {
      setView("list");
      setEditId(null);
      setForm(emptyForm);
      await loadProducts();
    });
  };

  // ── Delete product ──
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      await loadProducts();
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
              <label className="ap-label">🖼 Product Image URL</label>
              <input 
                className="ap-input" 
                name="img" 
                type="url" 
                placeholder="https://example.com/image.jpg" 
                value={form.img} 
                onChange={handleChange} 
              />
              <p className="ap-hint">Provide a direct URL to the product image.</p>
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
              <label className="ap-label">🖼 Product Image URL</label>
              <div className="ap-file-box ap-file-edit" style={{ border: 'none', padding: 0, background: 'transparent', minHeight: 'auto' }}>
                {form.img && (
                  <img src={form.img} alt="preview" className="ap-img-thumb" style={{ marginBottom: '10px' }} />
                )}
              </div>
              <input 
                className="ap-input" 
                name="img" 
                type="url" 
                placeholder="https://example.com/image.jpg" 
                value={form.img} 
                onChange={handleChange} 
              />
              <p className="ap-hint">Provide a direct URL to the product image.</p>
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
  if (loading) {
    return (
      <Adminlayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", width: "100%" }}>
          <h3>Loading products...</h3>
        </div>
      </Adminlayout>
    );
  }

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
                  <tr key={p._id}>
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
                        <button className="ap-del-btn" title="Delete" onClick={() => handleDelete(p._id)}>
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