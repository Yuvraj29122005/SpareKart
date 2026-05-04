// ========= Products.jsx (User Panel) =========
// Responsibility:
// - Main catalogue page showing all products.
// - Provides text search and category filter via the backend API.
// - Allows the user to either open the details page or add directly to cart.
//
// Data flow:
// - Receives `addToCart` and `cartCount` from App.jsx.
// - Fetches products from the backend API based on search and category filters.
// - Uses React local state for `search` and `category`.
//
// UX behaviour:
// - Typing in the search box updates the `search` state on every keystroke.
// - Changing the category dropdown updates the `category` state.
// - Products are re-fetched from the API whenever filters change.
// - Clicking a card navigates to `/product/:id`.
// - Clicking the "🛒 Add" button uses `stopPropagation()` so the click
//   does NOT trigger the card's navigation, it only adds to the cart.
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Products.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../data/api";

function Products({ addToCart, cartCount }) {
  const navigate = useNavigate();            // used to move to /product/:id

  // controlled values for the search input and category dropdown
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);

  // list of options shown in the category <select>
  const categories = ["All", "Engine", "Brakes", "Tyres", "Lights", "Accessories"];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(
          `/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(
            category
          )}`
        );
        setProducts(data);
      } catch {
        setProducts([]);
      }
    };
    load();
  }, [search, category]);

  const filtered = products;

  return (
    <>
      {/* navbar shows brand and mini profile, plus cart icon */}
      <Navbar cartCount={cartCount} />

      <div className="products-page">

        <h2 className="page-title">Our Products</h2>

        {/* two-column layout: filters on left, product grid on right */}
        <div className="products-layout">

          {/* ── LEFT SIDEBAR: filters ── */}
          <div className="filter-box">

            <p className="filter-heading">☰ Filters</p>

            {/* search by name, updates "search" state on every key press */}
            <label className="filter-label">Search</label>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="filter-input"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* drop-down category filter; "All" shows everything */}
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>

          </div>

          {/* ── RIGHT GRID: filtered product cards ── */}
          <div className="products-grid-wrap">

            <p className="results-count">
              Showing {filtered.length} product(s)
            </p>

            {filtered.length === 0 ? (
              // message when no products match current filters
              <p className="no-results">No products found.</p>
            ) : (
              <div className="products-grid">
                {filtered.map((p) => (
                  <div
                    key={p._id}
                    className="product-card"
                    // clicking anywhere on the card opens details page
                    onClick={() => navigate(`/product/${p._id}`)}
                  >
                    <img src={p.img} alt={p.name} />
                    <div className="card-body">
                      <h4>{p.name}</h4>
                      <p className="desc">{p.desc}</p>
                      <div className="card-bottom">
                        <span className="price">₹{p.price}</span>
                        {/* "Add" only mutates cart and does NOT navigate */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();        // stop card click navigation
                            addToCart(p);               // call shared hook via props
                            alert(`${p.name} added to cart!`);
                          }}
                        >
                          🛒 Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Products;