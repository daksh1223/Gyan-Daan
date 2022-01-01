const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }], // All the rooms that a particular user can access
  isAdmin: { type: Boolean, default: false },
  isEducator: { type: Boolean, default: false },
  isVerified: {type: Boolean, default: false},
	tags: [{ type: String }],
	about: String,
	idUrl: String,
  profilepicUrl: String,
  
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
