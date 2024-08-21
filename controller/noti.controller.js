const NotificationModel = require("../model/notification");

const sendNotifi = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).send({ msg: "Message required" });

    const newNoti = new NotificationModel({
      date: Date.now(),
      message,
    });

    await newNoti.save();
    res
      .status(201)
      .send({ msg: "Notification added successfully", notification: newNoti });
  } catch (error) {
    console.error("Error adding notification:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

const getAllNotifi = async (req, res) => {
  try {
    const notifications = await NotificationModel.find();
    res
      .status(200)
      .send({ msg: "Notifications retrieved successfully", notifications });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};
const getLatestNotifi = async (req, res) => {
  try {
    const latestNotification = await NotificationModel.findOne().sort({
      date: -1,
    });
    if (!latestNotification)
      return res.status(404).send({ msg: "No notifications found" });

    res.status(200).send({
      msg: "Latest notification retrieved successfully",
      notification: latestNotification,
    });
  } catch (error) {
    console.error("Error retrieving latest notification:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

const updateNotifi = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).send({ msg: "Message required" });

    const updatedNotification = await NotificationModel.findByIdAndUpdate(
      id,
      { message, date: Date.now() },
      { new: true }
    );
    if (!updatedNotification)
      return res.status(404).send({ msg: "Notification not found" });

    res.status(200).send({
      msg: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

const deleteNotifi = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedNotification = await NotificationModel.findByIdAndDelete(id);
    if (!deletedNotification)
      return res.status(404).send({ msg: "Notification not found" });

    res.status(200).send({
      msg: "Notification deleted successfully",
      notification: deletedNotification,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .send({ msg: "Internal server error", error: error.message });
  }
};

module.exports = {
  sendNotifi,
  getAllNotifi,
  updateNotifi,
  deleteNotifi,
  getLatestNotifi,
};
