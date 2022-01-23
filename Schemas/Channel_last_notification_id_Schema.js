const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Channel_last_notification_id_Schema = mongoose.Schema({
  channel: { type: Schema.Types.ObjectId, ref: "Channel" },
  last_notification_id: { type: Number, default: 0 },
});

const Channel_last_notification_id = mongoose.model("Channel_last_notification_id", Channel_last_notification_id_Schema);

module.exports = Channel_last_notification_id;
