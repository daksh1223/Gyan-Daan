const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema({
  title: String,
  content: String,
  timestamp: {
    type: Date,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
