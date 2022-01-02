const mongoose = require("mongoose");

const TrackerSchema = mongoose.Schema({
  StartTime: {
    type: Date,
  },
  EndTime: { type: Date },
  duration: { type: Number },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
    
const Tracker = mongoose.model("Tracker", TrackerSchema);

module.exports = Tracker;
