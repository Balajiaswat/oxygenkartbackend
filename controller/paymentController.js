const Razorpay = require("razorpay");
const PaymentModel = require("../model/Payment");
const UserModel = require("../model/userModel");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getAllChatPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find().populate({
      path: "userId", // Populate the user details
      select: "email username", // Select the fields to return
    });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: "No chat payments found" });
    }

    // Format the response to include the required fields, and convert amount from paisa to rupees
    const formattedPayments = payments.map((payment) => ({
      paymentId: payment._id, // Payment ID
      email: payment.userId.email, // User email
      username: payment.userId.username, // User username
      amount: (payment.amount / 100).toFixed(2), // Convert paisa to rupees and keep 2 decimal places
      date: payment.date, // Payment date
    }));

    // Send formatted payments as a response
    res.status(200).json({ payments: formattedPayments });
  } catch (error) {
    console.error("Error fetching chat payments:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Check if the user has already made the payment today
const checkPayment = async (req, res) => {
  const userId = req.userId; // Get userId from the request object

  try {
    // Find the user by userId
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the user's payment status is true
    return res.json({ payment: user.payment });
  } catch (error) {
    console.error("Error checking payment:", error); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "Server error while checking payment." });
  }
};

const createOrder = async (req, res) => {
  const { amount } = req.body; // Extract amount from the request body
  const userId = req.userId; // Extract userId from the request

  // Validate that amount is provided and is a positive number
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "A valid amount is required." });
  }

  // Validate that userId is provided
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const options = {
      amount: amount * 100, // Convert amount to paise (e.g., ₹5 = 500 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`, // Unique receipt identifier
    };

    const order = await razorpay.orders.create(options); // Create the order in Razorpay

    // Return the order along with the userId
    res.json({ order, userId });
  } catch (error) {
    console.error("Error creating order:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to create Razorpay order." });
  }
};

// Verify Razorpay payment and save it to the database
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const userId = req.userId; // Extract userId from the request

  const secret = process.env.RAZORPAY_KEY_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    // Save payment to the database
    const amount = req.body.amount; // Ensure amount is passed in the request body
    const newPayment = new PaymentModel({
      userId,
      amount, // Store the amount received in the request
    });

    try {
      await newPayment.save();
      await UserModel.findByIdAndUpdate(userId, { payment: true });
      res.json({ success: true, message: "Payment verified and saved." });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "Error saving payment." });
    }
  } else {
    res.status(400).json({ error: "Payment verification failed." });
  }
};

module.exports = {
  checkPayment,
  createOrder,
  verifyPayment,
  getAllChatPayments,
};
