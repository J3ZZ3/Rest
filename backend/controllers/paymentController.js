const Payment = require('../models/paymentModel');
const Reservation = require('../models/reservationModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPayment = async (req, res) => {
  try {
    const { reservationId, amount, paymentType } = req.body;
    
    if (paymentType === 'pay_on_arrival') {
      const payment = await Payment.create({
        reservationId,
        amount,
        paymentType,
        status: 'pending'
      });
      
      await Reservation.findByIdAndUpdate(reservationId, { paymentStatus: 'pending' });
      
      return res.status(200).json({ payment });
    }
    
    // Create Stripe payment intent for online payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { reservationId }
    });
    
    const payment = await Payment.create({
      reservationId,
      amount,
      paymentType: 'online',
      status: 'pending',
      transactionId: paymentIntent.id
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
