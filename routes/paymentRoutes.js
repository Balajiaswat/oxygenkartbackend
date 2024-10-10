const express = require("express");
const {
  checkPayment,
  createOrder,
  verifyPayment,
} = require("../controller/paymentController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Check if payment is already made for the day
router.get("/check-payment", auth, checkPayment);

// Create Razorpay order
router.post("/create-order", auth, createOrder);

// Verify Razorpay payment
router.post("/verify-payment", auth, verifyPayment);

module.exports = router;
