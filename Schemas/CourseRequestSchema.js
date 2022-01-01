const mongoose = require("mongoose");

const CourseRequestSchema = mongoose.Schema({
  name: String,
  tags: [{ type: String }],
  requirements: String,
  RequestedAt: {
    type: Date,
    default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  },
});

const CourseRequest = mongoose.model("CourseRequest", CourseRequestSchema);
module.exports = CourseRequest;
