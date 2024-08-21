const AWS = require("aws-sdk");
const uuid = require("uuid");
const CourseModel = require("../model/course");

require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECRETKEY,
  region: process.env.AWSREGION,
});

const s3 = new AWS.S3();

const uploadToS3 = (key, buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: "instalingual-app-new",
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

// Create a new course
const addCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    let videoUrl = req.body.courseVideo || null; // Default to provided video URL if no file is uploaded

    if (!title || !description || (!videoUrl && !req.file)) {
      return res
        .status(400)
        .send({ msg: "Title, description, and video are required" });
    }

    if (req.file) {
      const videoFile = req.file;

      const videoBuffer = videoFile.buffer;
      const videoKey = `videos/${uuid.v4()}-${videoFile.originalname}`;

      await uploadToS3(videoKey, videoBuffer, videoFile.mimetype);
      videoUrl = `https://instalingual-app-new.s3.amazonaws.com/${videoKey}`;
    }

    const newCourse = new CourseModel({
      date: Date.now(),
      title,
      description,
      price,
      video: videoUrl,
    });

    await newCourse.save();

    res.status(201).send({ msg: "Course added successfully", newCourse });
  } catch (error) {
    console.error("Error adding course:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find();
    res.status(200).send(courses);
  } catch (error) {
    console.error("Error getting courses:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const courseId = req.params.id;
    let videoURL = req.body.courseVideo || null;

    if (req.file) {
      const videoFile = req.file;
      const videoBuffer = videoFile.buffer;
      const videoKey = `videos/${uuid.v4()}-${videoFile.originalname}`;
      await uploadToS3(videoKey, videoBuffer, videoFile.mimetype);
      videoURL = `https://instalingual-app-new.s3.amazonaws.com/${videoKey}`;
    }

    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).send({ msg: "Course not found" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    if (videoURL) {
      course.video = videoURL;
    }

    await course.save();

    res.status(200).send({ msg: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await CourseModel.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).send({ msg: "Course not found" });
    }

    res.status(200).send({ msg: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

module.exports = {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
};
