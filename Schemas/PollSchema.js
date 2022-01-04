const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PollSchema = mongoose.Schema({
  name: String,
  options: [{ type: Schema.Types.ObjectId, ref: "Option" }],
  type: String,
});

const Poll = mongoose.model("Poll", PollSchema);

module.exports = Poll;
