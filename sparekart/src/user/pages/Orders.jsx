import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Orders.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../../images/logo.png";
import { apiFetch } from "../../data/api";

// Orders page: shows either a list of all orders or
// a detailed view of one selected order (controlled by selectedOrder state).
function Orders({ orders, clearOrders, cartCount }) {
    // null  -> show list view
    // order -> show details for that specific order
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    // ── ORDER DETAILS VIEW ──
    if (selectedOrder) {
        // recalculate total for this selected order from its products array
        const total = selectedOrder.products.reduce(
            (sum, p) => sum + p.price * p.qty, 0
        );

        const handleGeneratePDF = async () => {
            let customerName = "Valued Customer";
            try {
                const userData = await apiFetch("/users/me");
                if (userData && userData.name) {
                    customerName = userData.name;
                }
            } catch (err) {
                console.error("Could not fetch user info for PDF", err);
            }

            const doc = new jsPDF();
            
            const img = new Image();
            img.src = logoUrl;
            
            const drawPDF = (logoElement) => {
                // Colors
                const primaryColor = [230, 57, 70]; // A nice red/primary color to match typical Sparekart if any, or default
                const textColor = [44, 62, 80];

                if (logoElement) {
                    doc.addImage(logoElement, "PNG", 14, 10, 25, 25);
                }

                doc.setFontSize(24);
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.text("SpareKart", 45, 22);
                
                doc.setFontSize(14);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.text("Order Receipt", 45, 30);

                doc.setFontSize(11);
                doc.text(`Customer Name: ${customerName}`, 14, 43);
                doc.text(`Order ID: ${selectedOrder.id}`, 14, 50);
                doc.text(`Date: ${selectedOrder.date}`, 14, 57);
                doc.text(`Payment: ${selectedOrder.payment} (${selectedOrder.paymentMethod})`, 14, 64);
                doc.text(`Shipping Address: ${selectedOrder.address}`, 14, 71);

                // Table limits and columns
                const tableColumn = ["Product Name", "Unit Price", "Qty", "Total"];
                const tableRows = [];

                selectedOrder.products.forEach(p => {
                    tableRows.push([
                        p.name,
                        `Rs. ${p.price.toLocaleString()}`,
                        p.qty,
                        `Rs. ${(p.price * p.qty).toLocaleString()}`
                    ]);
                });

                autoTable(doc, {
                    startY: 80,
                    head: [tableColumn],
                    body: tableRows,
                    theme: "striped",
                    headStyles: { fillColor: primaryColor }
                });

                const finalY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 120;
                
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(`Total Amount Paid: Rs. ${total.toLocaleString()}`, 14, finalY + 12);

                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text("Thank you for shopping with SpareKart!", 14, finalY + 25);

                doc.save(`SpareKart_Bill_${selectedOrder.id}.pdf`);
            };

            // Ensure image is loaded before generating PDF
            if (img.complete) {
                drawPDF(img);
            } else {
                img.onload = () => drawPDF(img);
                img.onerror = () => drawPDF(null);
            }
        };

        return (
            <>
                <Navbar cartCount={cartCount} />

                <div className="orders-page">
                    {/* simple link to go back to the main orders list */}
                    <span className="orders-back" onClick={() => setSelectedOrder(null)}>
                        ← Back to Orders
                    </span>

                    <h2 className="orders-title">Order Details</h2>

                    <div className="od-card">

                        {/* header row with order id and status badges */}
                        <div className="od-header">
                            <div>
                                <p className="od-id-label">Order ID</p>
                                <p className="od-id">{selectedOrder.id}</p>
                            </div>
                            <div className="od-badges">
                                <span className={selectedOrder.payment === "Paid" ? "badge processing" : "badge pending"}>
                                    {selectedOrder.payment}
                                </span>
                            </div>
                        </div>

                        <hr className="od-divider" />

                        {/* basic info about date, shipping address and payment */}
                        <div className="od-info-row">
                            <div className="od-info-item">
                                <span className="od-info-label">📅 Order Date</span>
                                <span className="od-info-val">{selectedOrder.date}</span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">📍 Shipping Address</span>
                                <span className="od-info-val">{selectedOrder.address}</span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">💳 Payment</span>
                                <span className="od-info-val">{selectedOrder.paymentMethod}</span>
                            </div>
                        </div>

                        <hr className="od-divider" />

                        <p className="od-products-label">Ordered Products</p>

                        {/* list of all items that belong to this order */}
                        <div className="od-products-list">
                            {selectedOrder.products.map((p, i) => (
                                <div className="od-product-row" key={i}>
                                    <img src={p.img} alt={p.name} className="od-product-img" />
                                    <div className="od-product-info">
                                        <p className="od-product-name">{p.name}</p>
                                        <p className="od-product-qty">Qty: {p.qty}</p>
                                    </div>
                                    <p className="od-product-price">₹{(p.price * p.qty).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <hr className="od-divider" />

                        {/* footer row with grand total for this order */}
                        <div className="od-total-row">
                            <span className="od-total-label">Total</span>
                            <span className="od-total-val">₹{total.toLocaleString()}</span>
                        </div>

                        {/* PDF Download Button */}
                        <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end" }}>
                            <button 
                                className="orders-shop-btn" 
                                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
                                onClick={handleGeneratePDF}
                            >
                                📄 Download PDF Bill
                            </button>
                        </div>

                    </div>
                </div>

                <Footer />
            </>
        );
    }

    // ── MY ORDERS LIST VIEW ──
    return (
        <>
            <Navbar cartCount={cartCount} />

            <div className="orders-page">

                {/* header row with title and Clear Order History button */}
                <div className="orders-header-row">
                    <h2 className="orders-title">My Orders</h2>
                    {orders.length > 0 && (
                        <button className="clear-orders-btn" onClick={clearOrders}>
                            🗑 Clear Order History
                        </button>
                    )}
                </div>

                {/* Empty state shown when user has no orders yet */}
                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="orders-empty-icon">📋</div>
                        <h3>No Orders Yet</h3>
                        <p>You haven't placed any orders. Start shopping!</p>
                        <button className="orders-shop-btn" onClick={() => navigate("/products")}>
                            Browse Products
                        </button>
                    </div>
                ) : (

                    <div className="orders-list">
                        {orders.map((order) => {
                            // compute total amount once for each order for display
                            const total = order.products.reduce((sum, p) => sum + p.price * p.qty, 0);
                            return (
                                <div className="order-card" key={order.id}>

                                    {/* top row: id and current status badges */}
                                    <div className="order-card-top">
                                        <div className="order-id-box">
                                            <span className="order-id-icon">📦</span>
                                            <div>
                                                <p className="order-id-label">Order ID</p>
                                                <p className="order-id">{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="order-badges">
                                            <span className={order.payment === "Paid" ? "badge processing" : "badge pending"}>
                                                {order.payment}
                                            </span>
                                        </div>
                                    </div>

                                    {/* middle section: date, total amount, number of items */}
                                    <div className="order-card-info">
                                        <div className="order-info-item">
                                            <span className="order-info-icon">📅</span>
                                            <div>
                                                <p className="order-info-label">Order Date</p>
                                                <p className="order-info-val">{order.date}</p>
                                            </div>
                                        </div>
                                        <div className="order-info-item">
                                            <span className="order-info-icon">💰</span>
                                            <div>
                                                <p className="order-info-label">Total Amount</p>
                                                <p className="order-info-val">₹{total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="order-info-item">
                                            <span className="order-info-icon">📦</span>
                                            <div>
                                                <p className="order-info-label">Items</p>
                                                <p className="order-info-val">{order.products.length} item(s)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* shipping address summary for each order */}
                                    <div className="order-address-row">
                                        <span className="order-info-icon">📍</span>
                                        <p className="order-address">{order.address}</p>
                                    </div>

                                    {/* footer link that switches to the detailed view for this order */}
                                    <div className="order-card-footer">
                                        <span className="order-view-link" onClick={() => setSelectedOrder(order)}>
                                            → View Order Details
                                        </span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

export default Orders;