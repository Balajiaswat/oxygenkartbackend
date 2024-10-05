const express = require("express");
const {
  checkPayment,
  createOrder,
  verifyPayment,
} = require("../controller/paymentController");
const router = express.Router();

// Check if payment is already made for the day
router.post("/check-payment", checkPayment);

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify Razorpay payment
router.post("/verify-payment", verifyPayment);

module.exports = router;
