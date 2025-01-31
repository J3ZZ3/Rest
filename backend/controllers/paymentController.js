const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');
const axios = require('axios');

exports.createPayment = async (req, res) => {
  const { amount, email, name } = req.body;

  try {
    const response = await axios.post('https://payfast.co.za/eng/process', {
      // PayFast payment details
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: amount,
      item_name: 'Reservation Payment',
      email: email,
      // Additional PayFast parameters
    });
    res.status(200).json({ approvalUrl: response.data.approvalUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
