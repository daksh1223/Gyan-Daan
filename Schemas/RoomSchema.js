const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = mongoose.Schema({
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  userCount: { type: Number, default: 0 },
  room_color: String, // Color of the room's image
  channels: [{ type: Schema.Types.ObjectId, ref: "Channel" }],
  tags: [{ type: String }],
  rating: {type: mongoose.Schema.Types.Decimal128, default: 3 }
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
