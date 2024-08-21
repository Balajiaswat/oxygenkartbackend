const CourseOrderModel = require("../model/CourseOrder");

const buyOrder = async (req, res) => {
  try {
    const userId = req.userId; // Assuming req.userId is set by some authentication middleware
    const courseId = req.params.courseId;

    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ error: "User ID and Course ID are required" });
    }

    const newOrder = new CourseOrderModel({ userId, courseId });
    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const orders = await CourseOrderModel.find()
      .populate("courseId")
      .populate("userId")
      .exec();

    if (!orders || orders.length === 0) {
      console.log("No orders found");
      return res.status(404).json({ error: "No orders found" });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Server error:", error);
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
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  buyOrder,
  getOrdersByUser,
  deleteOrder,
};
