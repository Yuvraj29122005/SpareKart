import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Cart.css";
import { useNavigate } from "react-router-dom";

function Cart({ cart, removeFromCart, increaseQty, decreaseQty, cartCount }) {
  const navigate = useNavigate();  // allows moving back to products or to checkout

  // calculate total price of all items in cart (runs on every render)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} />

      <div className="cart-page">

        {/* show friendly empty state when no products are in the cart */}
        {cart.length === 0 ? (

          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your Cart is Empty</h2>
            <p>Add some products to start shopping.</p>
            <button className="cart-shop-btn" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>

        ) : (

          <div className="cart-layout">

            {/* LEFT: list of line items with quantity controls */}
            <div className="cart-left">
              <h2 className="cart-title">Your Cart</h2>

              {cart.map((item) => (
                <div className="cart-card" key={item.id}>

                  {/* image and title both navigate back to that product's details */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="cart-img"
                    onClick={() => navigate(`/product/${item.id}`)}
                  />

                  <div className="cart-info">
                    <h4
                      className="cart-item-name"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h4>
                    <p className="cart-item-price">₹{item.price}</p>

                    {/* per‑item quantity stepper and line total */}
                    <div className="cart-qty-row">
                      <button
                        className="cart-qty-btn"
                        onClick={() => decreaseQty(item.id)}
                      >
                        −
                      </button>
                      <span className="cart-qty-num">{item.qty}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => increaseQty(item.id)}
                        disabled={item.qty >= item.stock}
                      >
                        +
                      </button>
                      <span className="cart-item-total">
                        = ₹{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* remove this item completely from cart */}
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑 Remove
                  </button>

                </div>
              ))}
            </div>

            {/* RIGHT: condensed order summary */}
            <div className="cart-right">
              <h4 className="cart-summary-title">Order Summary</h4>

              {/* one line per product with name × qty and line total */}
              {cart.map((item) => (
                <div className="cart-summary-row" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}

              <div className="cart-summary-divider" />

              <div className="cart-summary-row">
                <span>Shipping</span>
                <span style={{ color: "green" }}>Free</span>
              </div>

              <div className="cart-summary-divider" />

              {/* final subtotal displayed at bottom */}
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {/* moves user forward to checkout page */}
              <button className="cart-checkout-btn" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Cart;