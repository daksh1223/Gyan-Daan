const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Creating a Schema for uploaded files
const fileSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: [true, "Uploaded file must have a name"],
  },
  path: {
    type: String,
  },
  displayName: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

// Creating a Model from that Schema
const File = mongoose.model("File", fileSchema);

// Exporting the Model to use it in app.js File.
module.exports = File;
