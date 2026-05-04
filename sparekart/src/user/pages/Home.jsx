
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import homeBg from "../../images/home.png";
import { useEffect, useState } from "react";
import { apiFetch } from "../../data/api";

function Home({ addToCart, cartCount }) {
  const navigate = useNavigate();  // for navigating to product details or products list
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/products");
        setProducts(data);
      } catch {
        setProducts([]);
      }
    };
    load();
  }, []);

  return (
    <>
      {/* shared navbar with brand + cart icon */}
      <Navbar cartCount={cartCount} />

      {/* ── Hero section with banner image ── */}
      <div className="hero">
        <img src={homeBg} alt="SpareKart" className="hero-img" />
      </div>

      {/* ── Featured Products section ── */}
      <div className="products-section">
        <h3 className="section-title">Featured Products</h3>

        <div className="products-grid">
          {/* take only first 6 products to keep home page short */}
          {products.slice(0, 6).map((p) => (
            <div
              key={p._id}
              className="product-card"
              // clicking card opens full product details
              onClick={() => navigate(`/product/${p._id}`)}
            >
              <img src={p.img} alt={p.name} className="product-img" />

              <div className="product-body">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>

              <div className="product-footer">
                <span className="price">₹{p.price}</span>
                {/* inner button only adds to cart, does not navigate */}
                <button
                  className="btn-add"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent parent click handler
                    addToCart(p);
                    alert(`${p.name} added to cart!`);
                  }}
                >
                  🛒 Add
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* button to go to full catalogue page */}
        <div className="view-all-row">
          <button className="btn-view-all" onClick={() => navigate("/products")}>
            View All Products
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;