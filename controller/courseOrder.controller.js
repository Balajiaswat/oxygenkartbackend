const CourseOrderModel = require("../model/CourseOrder");
const UserModel = require("../model/userModel");
const Razorpay = require("razorpay");

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

    const course = await CourseOrderModel.findById(courseId).populate(
      "courseId"
    );
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const coursePrice = course.price * 100;

    const order = await razorpayInstance.orders.create({
      amount: coursePrice,
      currency: "INR",
      receipt: `receipt_${Math.random().toString(36).substring(2, 9)}`,
      payment_capture: 1,
    });

    const newOrder = new CourseOrderModel({
      userId,
      courseId: course._id,
    });
    await newOrder.save();

    res.status(201).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      orderDetails: newOrder,
    });

    await UserModel.findByIdAndUpdate(userId, { payment: true });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
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
};
