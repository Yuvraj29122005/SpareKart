import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../css/Feedback.css";
import { useState } from "react";

// Feedback page: simple controlled form that collects
// name, email, and message, validates them, and shows an alert.
function Feedback() {

    // "form" holds values of all three inputs
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: ""
    });

    // single error string for the form (could be expanded to field-wise)
    const [error, setError] = useState("");

    // update the corresponding property in form object based on input "name" attribute
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // stop default page reload on submit

        // very simple validation: all 3 fields must be non-empty
        if (!form.name || !form.email || !form.message) {
            setError("All fields are required");
            return;
        }

        // clear any previous error and give user success feedback
        setError("");
        alert("Feedback submitted successfully");
        // reset all fields back to empty strings
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <>
            <Navbar />

            <div className="feedback-page">

                {/* main feedback card in the center */}
                <form className="feedback-card" onSubmit={handleSubmit}>

                    <div className="feedback-icon">💬</div>

                    <h2>We Value Your Feedback</h2>
                    <p className="sub">Help us improve our service</p>

                    {/* show one generic error message above fields */}
                    {error && <p className="error">{error}</p>}

                    {/* Name input bound to form.name */}
                    <div className="field">
                        <label>Name</label>
                        <input
                            name="name"
                            placeholder="Enter your name"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email input bound to form.email */}
                    <div className="field">
                        <label>Email</label>
                        <input
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Textarea for message bound to form.message */}
                    <div className="field">
                        <label>Message</label>
                        <textarea
                            name="message"
                            placeholder="Share your thoughts..."
                            rows="4"
                            value={form.message}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="submit-btn">Submit Feedback</button>

                </form>

            </div>

            <Footer />
        </>
    );
}

export default Feedback;
