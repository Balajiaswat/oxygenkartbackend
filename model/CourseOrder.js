const mongoose = require("mongoose");

const courseOrder = mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CourseOrderModel = mongoose.model("Order", courseOrder);

module.exports = CourseOrderModel;
