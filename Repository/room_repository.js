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
const get_popular_rooms = async () => {
  const courses = await Rooms.find().sort({ userCount: -1 })
  return courses;
}
const get_oldest_rooms = async () => {
  const courses = await Rooms.find().sort({ _id : 1 })
  return courses;
}
const get_latest_rooms = async () => {
  const courses = await Rooms.find().sort({ _id: -1 })
  return courses;
}
const get_most_liked_rooms = async () => {
  const courses = await Rooms.find().sort({ likeCount : -1 })
  return courses;
}
module.exports = {
  create_new_room,
  find_room_by_id,
  find_room_by_id_and_populate_channels,
  get_popular_rooms,
  get_oldest_rooms,
  get_latest_rooms,
  get_most_liked_rooms
}
