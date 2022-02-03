const mongoose = require("mongoose");

const CourseRequestSchema = mongoose.Schema({
	name: String,
	tags: [{ type: String }],
	requirements: String,
	RequestedAt: {
		type: Date,
		default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const CourseRequest = mongoose.model("CourseRequest", CourseRequestSchema);
module.exports = CourseRequest;
