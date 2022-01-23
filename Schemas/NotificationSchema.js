const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  title: String,
  content: String,
  timestamp: {
    type: Date,
    default: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
