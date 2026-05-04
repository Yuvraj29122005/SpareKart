const nodemailer = require("nodemailer");

// Create transporter with connection pooling and keep-alive
// This reuses SMTP connections instead of creating a new one per email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,          // use pooled connections
  maxConnections: 3,   // max simultaneous connections
  maxMessages: 10,     // max messages per connection before reconnect
  rateDelta: 1000,     // rate limit: 1 second between messages
  rateLimit: 5,        // max 5 messages per rateDelta
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000
});

// Verify SMTP connection on startup (non-blocking)
transporter.verify()
  .then(() => console.log("SMTP mailer ready"))
  .catch((err) => console.error("SMTP connection failed:", err.message));

/**
 * Send OTP verification email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 */
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Sparekart" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email – Sparekart",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:30px;background:#f9fafb;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#2f6fed;margin:0;">Sparekart</h1>
          <p style="color:#6b7280;font-size:14px;">Email Verification</p>
        </div>
        <div style="background:#fff;padding:30px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;">
          <p style="font-size:16px;color:#374151;margin-bottom:8px;">Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2f6fed;padding:16px 0;">${otp}</div>
          <p style="font-size:13px;color:#9ca3af;margin-top:16px;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="font-size:13px;color:#9ca3af;">If you didn't request this, please ignore this email.</p>
        </div>
        <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:20px;">© Sparekart – Car Spare Parts Hub</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
