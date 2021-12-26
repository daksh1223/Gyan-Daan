const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelSchema = mongoose.Schema({
  name: String,
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  is_meet: Schema.Types.Boolean, // To check whether it is a normal channel or a meet channel 
  messages: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
  meet_link: String,
  meets: [{ type: Schema.Types.ObjectId, ref: "Channel" }], // All meet channels present in a normal channel
});

const Channel = mongoose.model("Channel", ChannelSchema);

module.exports = Channel;
