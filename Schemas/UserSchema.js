const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }], // All the rooms that a particular user can access
	isAdmin: { type: Boolean, default: true },
	isEducator: { type: Boolean, default: false },
	isVerified: { type: Boolean, default: true },
	tags: [{ type: String }],
	about: { type: String, default: '' },
	idUrl: String,
	profilepicUrl: { type: String, default: "/images/user.jpg" },
	channel_last_notification_id: [
		{ type: Schema.Types.ObjectId, ref: "Channel_last_notification_id" },
	],
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
