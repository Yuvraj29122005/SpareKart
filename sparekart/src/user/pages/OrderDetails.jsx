import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/OrderDetails.css";
import { useParams, useNavigate } from "react-router-dom";

function OrderDetails() {

    const { id } = useParams();      // read order id from URL
    const navigate = useNavigate();  // to go back to the orders list

    return (
        <>
            <Navbar />

            <div className="details-container">

                {/* BACK BUTTON to full orders list */}
                <button
                    className="back-btn"
                    onClick={() => navigate("/orders")}
                >
                    ← Back to My Orders
                </button>

                <h2>Order Details</h2>

                <div className="details-card">

                    <div className="details-header">
                        <h3>Order ID: {id}</h3>

                        {/* STATUS + PAYMENT */}
                        <div className="status-group">
                            <span className="status delivered">Delivered</span>
                            <span className="payment-badge">Payment: Completed</span>
                        </div>
                    </div>

                    <div className="details-grid">

                        <div>
                            {/* These values are currently static demo data, not dynamic */}
                            <p><b>Order Date:</b> 2026-02-05</p>
                            <p><b>Total Amount:</b> ₹2999.00</p>
                            <p><b>Items:</b> 2 item(s)</p>
                        </div>

                        <div>
                            <p><b>Shipping Address:</b></p>
                            <p>123 Main Street, City, State 123456</p>
                        </div>

                    </div>

                    <hr />

                    <h4>Products in this Order</h4>

                    <div className="product-row">
                        <span>Engine Oil Filter</span>
                        <span>₹499</span>
                    </div>

                    <div className="product-row">
                        <span>Brake Disc Set</span>
                        <span>₹2500</span>
                    </div>

                    <div className="total">
                        Total: ₹2999.00
                    </div>

                </div>

            </div>

            <Footer />
        </>
    );
}

export default OrderDetails;
