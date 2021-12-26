const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StreamSchema = mongoose.Schema({
  user: String,
  useremail:String,
  userid: String //uid corresponding to the user
});

const Stream = mongoose.model("Stream", StreamSchema);

module.exports = Stream;
