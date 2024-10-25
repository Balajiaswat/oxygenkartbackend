const Razorpay = require("razorpay");
const PaymentModel = require("../model/Payment");
const UserModel = require("../model/userModel");
const crypto = require("crypto");
const CourseOrderModel = require("../model/CourseOrder");
const cron = require("node-cron");

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

const combinePayment = async (req, res) => {
  try {
    // Fetch all payments
    const payments = await PaymentModel.find()
      .populate("userId") // Populate user data if needed
      .sort({ date: -1 }); // Sort payments by date descending

    // Fetch all course orders
    const courseOrders = await CourseOrderModel.find()
      .populate("userId") // Populate user data if needed
      .populate("courseId") // Populate course data if needed
      .sort({ orderDate: -1 }); // Sort course orders by orderDate descending

    // Combine both payments and course orders
    const combined = [
      ...payments.map((payment) => ({
        type: "Chat", // Renamed from "payment" to "Chat"
        id: payment._id,
        userId: payment.userId,
        date: payment.date,
        amount: payment.amount,
      })),
      ...courseOrders.map((order) => ({
        type: "CourseOrder", // Renamed from "courseOrder" to "CourseOrder"
        id: order._id,
        userId: order.userId,
        date: order.orderDate,
        courseId: order.courseId,
        // Assuming you have a price field in your CourseOrderModel
        amount: order.price || 0, // Default to 0 if no price field exists
      })),
    ];

    // Sort combined data by date descending
    combined.sort((a, b) => b.date - a.date);

    // Optional: Limit the number of records to the latest N (e.g., 5)
    // const limit = 5; // Change this value to the desired number of latest records
    // const latestCombined = combined.slice(0, limit);

    res.status(200).json(combined);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ message: "Error fetching combined data" });
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

// Helper function to get today's date with a specific time
// const getTimeToday = (hour, minute) => {
//   const now = new Date();
//   return new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate(),
//     hour,
//     minute
//   );
// };

cron.schedule("0 0 * * *", async () => {
  try {
    // Update all users' payment status to false
    await UserModel.updateMany({ payment: true }, { payment: false });
    console.log("Payment status reset for all users.");
  } catch (error) {
    console.error("Error resetting payment status:", error);
  }
});

const createOrder = async (req, res) => {
  const { amount } = req.body; // Extract amount from the request body
  const userId = req.userId; // Extract userId from the request

  // // Define the allowed order creation time range: 9:00 AM to 3:30 PM IST
  // const startTime = getTimeToday(9, 0); // 9:00 AM IST
  // const endTime = getTimeToday(15, 30); // 3:30 PM IST

  // const now = new Date();

  // // Check if the current time is outside the allowed range
  // if (now < startTime || now > endTime) {
  //   return res.status(403).json({
  //     msg: "Order creation is only allowed between 9:00 AM and 3:30 PM IST",
  //   });
  // }

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
  combinePayment,
};
