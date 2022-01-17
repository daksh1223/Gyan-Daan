const mongoose = require("mongoose");
const tagSchema = new mongoose.Schema({
	name: { type: String, unique: true, required: true },
	rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    users: [{ type: String }],
});
module.exports = mongoose.model("Tag", tagSchema);