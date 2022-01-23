const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = mongoose.Schema({
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  userCount: { type: Number, default: 0 },
  room_color: String, // Color of the room's image
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  tags: [{ type: String }],
  likeCount: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  description: { type: String, default: "" },
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
