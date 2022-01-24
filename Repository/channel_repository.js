const Channels = require("../Schemas/ChannelSchema");

const create_new_channel = () => {
  return new Channels(); // Will return a newly created channel.
};
const find_channel_by_id = async (id) => {
  return await Channels.findById(id);
};
const find_channel_by_id_and_populate_all_data = async (id) => {
  return await Channels.findById(id) // Will populate the required channel with all messages, users and meets instead of just returning their Object id
    .populate("messages")
    .populate("users")
    .populate("meets")
    .populate("notifications")
};
exports.create_new_channel = create_new_channel;
exports.find_channel_by_id = find_channel_by_id;
exports.find_channel_by_id_and_populate_all_data =
  find_channel_by_id_and_populate_all_data;
