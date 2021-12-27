const { find_user_by_email } = require("../Repository/user_repository");
const { create_new_room } = require("../Repository/room_repository");
const { create_new_channel } = require("../Repository/channel_repository");
const Room = require("../Schemas/RoomSchema");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function create_room(roominfo, session_user) {
  let user = await find_user_by_email(session_user.email);
  let room = create_new_room();
  let channel = create_new_channel();

  room.name = roominfo.name;
  channel.name = "General"; // By default the newly created room will have a "General" channel present.
  room.users.push(user);
  room.userCount += 1;
  channel.users.push(user);
  room.room_color = roominfo.color;
  channel.is_meet = false;

  roominfo.room_tags.forEach((tag) => {
    // Add the tags associated with this course
    room.tags.push(tag);
  });

  room.channels.push(channel);
  channel.save();
  room.save();
  user.rooms.push(room);
  user.save();

  return room;
}


module.exports = {
  create_room,
}
