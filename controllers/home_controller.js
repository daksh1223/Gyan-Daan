const { find_user_by_email } = require("../Repository/user_repository");
const {
  create_new_room,
  find_room_by_id,
} = require("../Repository/room_repository");
const { create_new_channel } = require("../Repository/channel_repository");
const {
  get_tag_by_name,
  create_new_tag,
} = require("../Repository/tag_repository.js");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const removeAddRoomsFromTags = async (room, tag) => {
  let roomIndex = tag.rooms.indexOf(room._id);
  let tagIndex = room.tags.indexOf(tag.name);
  if (roomIndex != -1) {
    tag.rooms.splice(roomIndex, 1);
  } else {
    tag.rooms.push(room._id);
  }

  if (tagIndex != -1) {
    room.tags.splice(tagIndex, 1);
  } else {
    room.tags.push(tag.name);
  }

  await tag.save();

  return "successful";
};
async function create_room(roominfo, session_user) {
  let user = await find_user_by_email(session_user.email);
  let room = create_new_room();
  let channel = create_new_channel();

  room.name = roominfo.name;
  channel.name = "General"; // By default the newly created room will have a "General" channel present.
  room.users.push(session_user._id);
  room.userCount += 1;
  channel.users.push(session_user._id);
  room.creator = session_user._id;
  room.room_color = roominfo.color;
  channel.is_meet = false;
  room.description = roominfo.description;
  //console.log(roominfo.room_tags);
  let addTags = [roominfo.name, ...roominfo.room_tags];

  if (addTags) {
    for (let i = 0; i < addTags.length; i++) {
      let addTag = await get_tag_by_name(addTags[i].toLowerCase());
		// console.log(addTag);
      if (!addTag) {
        addTag = await create_new_tag(addTags[i].toLowerCase());
      }
      await removeAddRoomsFromTags(room, addTag);
    }
  }

  room.channels.push(channel);
  channel.save();
  room.save();
  user.rooms.push(room);
  user.save();

  return room;
}

async function update_room(roominfo) {
  let room = await find_room_by_id(roominfo.id);
  room.name = roominfo.name;
  room.description = roominfo.description;
  let tags = roominfo.tags;

  if (tags) {
    let removeTags = room.tags.filter((tag) => {
      return !tags.includes(tag);
    });
    let addTags = tags.filter((tag) => {
      return !room.tags.includes(tag);
    });
    //console.log('remove - ', removeTags);
    //console.log('add - ', addTags);
    for (let i = 0; i < removeTags.length; i++) {
      let removeTag = await get_tag_by_name(removeTags[i]);
      await removeAddRoomsFromTags(room, removeTag);
    }

    for (let i = 0; i < addTags.length; i++) {
      let addTag = await get_tag_by_name(addTags[i]);

      if (!addTag) {
        addTag = await create_new_tag(addTags[i]);
      }
      await removeAddRoomsFromTags(room, addTag);
    }
  }
  room.save();
  return room;
}

module.exports = {
  create_room,
  update_room,
};
