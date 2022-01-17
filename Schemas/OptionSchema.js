const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OptionSchema = mongoose.Schema({
  name: String,
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likeCount: { type: Number, default: 0 },
});

const Option = mongoose.model("Option", OptionSchema);

module.exports = Option;
