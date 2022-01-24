const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = mongoose.Schema({
  username: String,
  email: String,
  timestamp: String, // Time at which the message was send
  message: String,
  type:String
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
