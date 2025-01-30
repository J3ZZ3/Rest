const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');
const paypal = require('@paypal/checkout-server-sdk');

// Configure PayPal SDK
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createPayment = async (req, res) => {
  const { amount, email, name } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount.toString(),
      },
    }],
    application_context: {
      return_url: 'https://your-frontend-url/return', // URL to redirect after payment
      cancel_url: 'https://your-frontend-url/cancel', // URL to redirect if payment is canceled
    },
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({ approvalUrl: order.result.links.find(link => link.rel === 'approve').href });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
