const Razorpay = require("razorpay");
const PaymentModel = require("../model/Payment");
const UserModel = require("../model/userModel");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Check if the user has already made the payment today
const checkPayment = async (req, res) => {
  const userId = req.body.userId;

  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const payment = await PaymentModel.findOne({ userId, date: today });

    if (payment) {
      return res.json({ payment: true });
    } else {
      return res.json({ payment: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error while checking payment." });
  }
};

// Create Razorpay order
const createOrder = async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // Amount in paise (₹5 = 500 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create Razorpay order." });
  }
};

// Verify Razorpay payment and save it to the database
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } =
    req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    // Save payment to the database
    const newPayment = new PaymentModel({
      userId,
      amount: 5, // ₹5 payment
    });

    try {
      await newPayment.save();
      await UserModel.findByIdAndUpdate(userId, { payment: true });
      res.json({ success: true, message: "Payment verified and saved." });
    } catch (error) {
      res.status(500).json({ error: "Error saving payment." });
    }
  } else {
    res.status(400).json({ error: "Payment verification failed." });
  }
};

module.exports = { checkPayment, createOrder, verifyPayment };
