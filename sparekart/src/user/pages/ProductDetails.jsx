import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/ProductDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../../data/api";

function ProductDetails({ addToCart, cartCount }) {
    const navigate = useNavigate();   // for going back or to checkout
    const { id } = useParams();       // read product id from URL (/product/:id)
    const [qty, setQty] = useState(1); // user-selected quantity for this product
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiFetch(`/products/${id}`);
                setProduct(data);
            } catch {
                setProduct(null);
            }
        };
        load();
    }, [id]);

    // if URL contains an invalid id, show simple "not found" state
    if (!product) {
        return (
            <>
                <Navbar cartCount={cartCount} />
                <div className="pd-page"><p>Product not found.</p></div>
                <Footer />
            </>
        );
    }

    // Add to Cart — adds `qty` copies of this product into shared cart state
    const handleAddToCart = () => {
        for (let i = 0; i < qty; i++) addToCart(product);
    };

    // Buy Now — skips cart and sends a one-time "buyNowItems" array to Checkout
    const handleBuyNow = () => {
        navigate("/checkout", {
            state: {
                buyNowItems: [{ ...product, qty }],
            },
        });
    };

    return (
        <>
            <Navbar cartCount={cartCount} />

            <div className="pd-page">

                {/* go back to previous page in history stack */}
                <span className="pd-back" onClick={() => navigate(-1)}>← Back</span>

                <div className="pd-layout">

                    {/* large product preview */}
                    <div className="pd-image-box">
                        <img src={product.img} alt={product.name} className="pd-image" />
                    </div>

                    {/* right-hand side with details and actions */}
                    <div className="pd-info">
                        <span className="pd-badge">{product.category}</span>
                        <h2 className="pd-name">{product.name}</h2>

                        <div className="pd-price-row">
                            <span className="pd-price">₹{product.price}</span>
                            {product.stock === 0 ? (
                                <span className="pd-stock" style={{ color: '#dc2626', fontWeight: 'bold' }}>Out of Stock</span>
                            ) : product.stock < 5 ? (
                                <span className="pd-stock" style={{ color: '#ea580c', fontWeight: 'bold' }}>Only {product.stock} left in stock!</span>
                            ) : (
                                <span className="pd-stock">In Stock ({product.stock})</span>
                            )}
                        </div>

                        <hr className="pd-divider" />

                        <p className="pd-desc-label">Description</p>
                        <p className="pd-desc">{product.desc}</p>

                        <hr className="pd-divider" />

                        {/* quantity stepper controls local qty state */}
                        <p className="pd-qty-label">Quantity</p>
                        <div className="pd-qty-row">
                            <button
                                className="pd-qty-btn"
                                onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                                disabled={product.stock === 0}
                            >
                                −
                            </button>
                            <span className="pd-qty-num">{product.stock === 0 ? 0 : qty}</span>
                            <button
                                className="pd-qty-btn"
                                onClick={() => setQty(qty < product.stock ? qty + 1 : product.stock)}
                                disabled={product.stock === 0 || qty >= product.stock}
                            >
                                +
                            </button>
                        </div>

                        {/* primary actions for this product */}
                        <div className="pd-btn-row">
                            <button 
                                className="pd-add-btn" 
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                🛒 Add to Cart
                            </button>
                            <button 
                                className="pd-buy-btn" 
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                Buy Now
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ProductDetails;