const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  video: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const CourseModel = mongoose.model("Course", courseSchema);

module.exports = CourseModel;
