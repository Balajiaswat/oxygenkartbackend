const express = require("express");
const multer = require("multer");
const courseRoute = express.Router();
const {
  addCourse,
  updateCourse,
  getCourses,
  deleteCourse,
} = require("../controller/course.controller");
const { auth } = require("../middleware/auth");

courseRoute.use(express.json({ limit: "50mb" }));

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Set the maximum file size to 50MB
  },
});

courseRoute.post("/add", auth, upload.single("courseVideo"), addCourse);
courseRoute.put(
  "/update/:id",
  auth,
  upload.single("courseVideo"),
  updateCourse
);
courseRoute.get("/get", getCourses);
courseRoute.delete("/delete/:id", auth, deleteCourse);

module.exports = courseRoute;
