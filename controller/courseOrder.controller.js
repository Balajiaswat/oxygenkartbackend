const CourseModel = require("../model/course");
const CourseOrderModel = require("../model/CourseOrder");
const UserModel = require("../model/userModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const PaymentModel = require("../model/Payment");

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const buyOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const courseId = req.params.courseId;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ error: "User ID and Course ID are required" });
    }

    // Fetch the course from the CourseModel (not CourseOrderModel)
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const coursePrice = course.price * 100; // Convert price to paise

    // Create the order with Razorpay
    const order = await razorpayInstance.orders.create({
      amount: coursePrice,
      currency: "INR",
      receipt: `receipt_${Math.random().toString(36).substring(2, 9)}`,
      payment_capture: 1,
    });

    // Create a new course order and save it
    const newOrder = new CourseOrderModel({
      userId,
      courseId: course._id,
    });
    await newOrder.save();

    // Send the order details in the response
    res.status(201).json({
      razorpay_order_id: order.id, // Include the Razorpay order ID
      currency: order.currency,
      amount: order.amount,
      orderDetails: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

const courseVerifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } =
    req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const userId = req.userId;

    // Create a new payment record
    const newPayment = new PaymentModel({
      userId,
      amount, // You may want to save this in paise if you are storing it in cents or another unit
    });

    await newPayment.save();

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Payment verified",
      payment: newPayment,
    });
  } else {
    // Payment verification failed
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.userId; // Ensure this is retrieved correctly
    const orders = await CourseOrderModel.find({ userId })
      .populate("courseId")
      .exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.orderId;

    if (!userId || !orderId) {
      return res
        .status(400)
        .json({ error: "User ID and Order ID are required" });
    }

    const order = await CourseOrderModel.findOneAndDelete({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found or unauthorized" });
    }

    res.status(200).json({ message: "Order deleted successfully", order });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  buyOrder,
  getOrdersByUser,
  deleteOrder,
  courseVerifyPayment,
};
