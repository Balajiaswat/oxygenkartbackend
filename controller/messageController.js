const messageModel = require("../model/messageModel");

// Create a new message
const addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const now = new Date();
    const created_date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const created_time = now.toTimeString().split(" ")[0]; // HH:MM:SS

    const newMessage = new messageModel({
      message,
      created_date,
      created_time,
    });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await messageModel.find();

    if (messages.length === 0) {
      return res.status(404).json({ msg: "No messages found" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to get today's date with a specific time
const getTimeToday = (hour, minute) => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute
  );
};

// Helper function to get today's date with a specific time
const getMessagesWithinTimeRange = async (req, res) => {
  try {
    const now = new Date();
    const startTime = getTimeToday(3, 30); // Adjusted for IST 8:30 AM (IST: 3:30 AM UTC)
    const endTime = getTimeToday(11, 30); // Adjusted for IST 4:30 PM (IST: 11:30 AM UTC)

    // console.log("now", now);
    // console.log("start", startTime);
    // console.log("end", endTime);

    // Check if the current time is outside the allowed range
    if (now < startTime || now > endTime) {
      return res.status(403).json({ msg: "Chat is locked" });
    }

    // Find messages created today within the allowed time range in IST
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const messages = await messageModel.find({
      created_at: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Filter messages within the 8:30 AM to 4:30 PM range in IST
    const filteredMessages = messages.filter((message) => {
      const messageTime = new Date(message.created_at);
      return messageTime >= startTime && messageTime <= endTime;
    });

    if (filteredMessages.length === 0) {
      return res.status(404).json({ msg: "No messages found" });
    }

    res.status(200).json(filteredMessages);
  } catch (error) {
    console.error("Error getting messages within time range:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a message by ID
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: " message are required" });
    }

    const updatedMessage = await messageModel.findByIdAndUpdate(
      id,
      { message },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a message by ID
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMessage = await messageModel.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ msg: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addMessage,
  getAllMessages,
  getMessagesWithinTimeRange,
  updateMessage,
  deleteMessage,
};
