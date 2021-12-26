const Rooms = require("../Schemas/RoomSchema");

const create_new_room = () => {
  return new Rooms(); // Will create a new room.
};
const find_room_by_id = async (id) => {
  return await Rooms.findById(id);
};
const find_room_by_id_and_populate_channels = async (id) => {
  return await Rooms.findById(id).populate("channels"); // Will populate the required channel with channels inside it.
};
exports.create_new_room = create_new_room;
exports.find_room_by_id = find_room_by_id;
exports.find_room_by_id_and_populate_channels =
  find_room_by_id_and_populate_channels;
