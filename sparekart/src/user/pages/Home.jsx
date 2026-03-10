import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import products from "../../data/productsData";
import homeBg from "../../images/home.png";

function Home({ addToCart, cartCount }) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar cartCount={cartCount} />

      <div className="hero" style={{ backgroundImage: `url(${homeBg})` }} />

      <div className="home-products">
        <h3 className="home-products-title">Featured Products</h3>

        <div className="product-grid">
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              <img src={p.img} alt={p.name} />
              <div className="card-body">
                <h4>{p.name}</h4>
                <p className="desc">{p.desc}</p>
                <div className="card-bottom">
                  <span className="price">₹{p.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                      alert(`${p.name} added to cart!`);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="view-btn" onClick={() => navigate("/products")}>
          View All Products
        </button>
      </div>

      <Footer />
    </>
  );
}

export default Home;