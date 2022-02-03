const router = require("express").Router();
const Streams = require("../Schemas/StreamSchema");
const CourseRequest = require("../Schemas/CourseRequestSchema");
const Tracker = require("../Schemas/TrackerSchema");
const Notification = require("../Schemas/NotificationSchema");
const Channel_last_notification_id = require("../Schemas/Channel_last_notification_id_Schema");
const {
  find_user_by_email,
  get_user_rooms,
  get_all_users,
  get_user_by_id_and_populate_Rooms,
  find_user_by_id_and_populate_last_notifications,
} = require("../Repository/user_repository");
const { set_new_stream } = require("../Repository/stream_repository.js");
const {
  find_room_by_id,
  find_room_by_id_and_populate_channels,
  get_popular_rooms,
  get_oldest_rooms,
  get_latest_rooms,
  get_most_liked_rooms,
} = require("../Repository/room_repository.js");
const {
  find_channel_by_id,
  create_new_channel,
  find_channel_by_id_and_populate_all_data,
} = require("../Repository/channel_repository.js");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const {
  get_tag_by_name,
  create_new_tag,
  get_all_tags,
} = require("../Repository/tag_repository.js");
const {
  create_new_option,
  update_vote,
  create_new_poll,
  find_poll_by_id,
} = require("../Repository/poll_repository");
const {
  create_new_chat,
  delete_chat,
  edit_chat,
} = require("../Repository/chat_repository");
const File = require("../Schemas/FileScema");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get("/get_user_details", async (req, res) => {
  let req_data = await get_user_by_id_and_populate_Rooms(req.user._id);
  res.json(req_data);
});
router
  .route("/get_all_rooms") // Will fetch all the rooms where the current user is present.
  .get(async (req, res) => {
    let rooms = await get_user_rooms(req.user.email);
    res.json(rooms);
  })
  .all((req, res) => {
    // It will only allow GET method.
    res.send(`${req.method} method is not allowed!`);
  });
router
  .route("/get_users") // Will fetch all the users present in the GyanDaan organization.
  .get(async (req, res) => {
    let users = await get_all_users();
    res.json(users);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router
  .route("/add_users") //Will be called to add users in a room or channel
  .post(async (req, res) => {
    //Will only allow post requests
    let users_to_add = req.body.users;
    let user_names = [];
    if (req.body.room_id) {
      // Check whether the post request is for a room or channel
      let room = await find_room_by_id(req.body.room_id);
      let channel = await find_channel_by_id(room.channels[0]._id);

      for (var i = 0; i < users_to_add.length; i++) {
        let user_to_add = await find_user_by_email(users_to_add[i]);
        if (user_to_add) {
          // Check whether the user to be added exists or not
          let user_present = !room.users.includes(user_to_add._id);

          if (user_present) {
            // Check whether the user is present in the room. If present then add in the General channel.
            user_names.push(user_to_add);
            room.users.push(user_to_add);
            room.userCount += 1;
            channel.users.push(user_to_add);
            user_to_add.rooms.push(room);
            user_to_add.save();
          }
        }
      }
      room.save();
      channel.save();
    } else {
      let room = await find_room_by_id(req.body.channel_room);
      let channel = await find_channel_by_id(req.body.channel_id);

      for (var i = 0; i < users_to_add.length; i++) {
        let user_to_add = await find_user_by_email(users_to_add[i]);
        if (user_to_add) {
          let user_present =
            room.users.includes(user_to_add._id) &&
            !channel.users.includes(user_to_add._id);
          if (user_present) {
            user_names.push(user_to_add);
            channel.users.push(user_to_add);
          }
        }
      }
      channel.save();
    }

    res.json(user_names);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .route("/remove_users") //Will be called to remove users in a room or channel
  .post(async (req, res) => {
    //Will only allow post requests
    let users_to_remove = req.body.users;
    let user_names = [];
    if (req.body.room_id) {
      // Check whether the post request is for a room or channel
      let room = await find_room_by_id(req.body.room_id);
      let all_channels = [];
      for (let i = 0; i < room.channels.length; i++) {
        let temp = await find_channel_by_id(room.channels[i]._id);
        all_channels.push(temp);
      }
      for (var i = 0; i < users_to_remove.length; i++) {
        let user_to_remove = await find_user_by_email(users_to_remove[i]);
        if (user_to_remove) {
          // Check whether the user to be removed exists or not
          let user_present = room.users.includes(user_to_remove._id);

          if (user_present) {
            // Check whether the user is present in the room. If present then remove from all the channel.
            user_names.push(user_to_remove);
            //console.log(room.users, user_to_remove._id);
            room.users = room.users.filter((user) => {
              return user != String(user_to_remove._id);
            });
            //console.log(room.users);
            for (let i = 0; i < room.channels.length; i++) {
              //console.log(all_channels[i].users);
              all_channels[i].users = all_channels[i].users.filter(
                (user) => user != String(user_to_remove._id)
              );
              //console.log(all_channels[i].users);
              all_channels[i].save();
            }
            user_to_remove.rooms = user_to_remove.rooms.filter((temp_room) => {
              room._id != temp_room;
            });
            user_to_remove.save();
          }
        }
      }
      room.save();
    } else {
      let room = await find_room_by_id(req.body.channel_room);
      let channel = await find_channel_by_id(req.body.channel_id);

      for (var i = 0; i < users_to_remove.length; i++) {
        let user_to_remove = await find_user_by_email(users_to_remove[i]);
        if (user_to_remove) {
          let user_present =
            room.users.includes(user_to_remove._id) &&
            channel.users.includes(user_to_remove._id);
          if (user_present) {
            user_names.push(user_to_remove);
            channel.users = channel.users.filter(
              (user_id) => String(user_to_remove._id) != user_id
            );
          }
        }
      }
      channel.save();
    }

    res.json(user_names);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/channel/:channel")
  .get(async (req, res) => {
    // Get channel details
    let channel_details = await find_channel_by_id_and_populate_all_data(
      req.params.channel
    );
    let user = await find_user_by_id_and_populate_last_notifications(
      req.user._id
    );
    if (
      !user.channel_last_notification_id.find(
        (e) => e.channel == req.params.channel
      )
    ) {
      let new_channel_last_notification_id = new Channel_last_notification_id();
      new_channel_last_notification_id.channel = req.params.channel;
      user.channel_last_notification_id.push(new_channel_last_notification_id);
      await new_channel_last_notification_id.save();
      await user.save();
    }
    let user_last_notification_id = user.channel_last_notification_id.find(
      (e) => e.channel == req.params.channel
    ).last_notification_id;
    // console.log(req.user._id,user.channel_last_notification_id)

    res.json({ channel_details, user_last_notification_id });
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router.route("/channel/:channel/notifications").post(async (req, res) => {
  let channel = await find_channel_by_id(req.params.channel),
    data = req.body.data;
  let new_notification = new Notification();
  new_notification.title = data.title;
  new_notification.timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  new_notification.content = data.content;
  new_notification.save();
  channel.notifications.push(new_notification);
  channel.save();
  res.json(new_notification);
});

router
  .route("/channel/:channel/notification/:notification")
  .delete(async (req, res) => {
    let channel = await find_channel_by_id(req.params.channel);
    channel.notifications = channel.notifications.filter((notification) => {
      return notification._id != req.params.notification;
    });
    let notification_to_delete = await Notification.findById(
      req.params.notification
    );
    notification_to_delete.delete();
    channel.save();
    res.json("Successful");
  })
  .put(async (req, res) => {
    let notification_to_edit = await Notification.findById(
        req.params.notification
      ),
      data = req.body.data;
    notification_to_edit.title = data.title;
    notification_to_edit.content = data.content;
    notification_to_edit.save();
    res.json(notification_to_edit);
  });

router
  .route("/channel/:channel/update_notification_id")
  .post(async (req, res) => {
    let data = req.body;
    if (data.type) {
      let channel = await find_channel_by_id(req.params.channel);
      channel.last_notification_id = data.last_notification_id;
      channel.save();
    } else {
      let user = await find_user_by_id_and_populate_last_notifications(
        req.user._id
      );
      let last_notification_id_container =
        user.channel_last_notification_id.find(
          (e) => e.channel == req.params.channel
        );
      last_notification_id_container.last_notification_id =
        data.last_notification_id;
      last_notification_id_container.save();
      user.save();
    }
    res.json("Succesfull!");
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router
  .route("/room") // Will be called to delete a room
  .delete(async (req, res) => {
    let room_id = req.body.room_id;

    let user = await find_user_by_email(req.user.email);
    let room = await find_room_by_id_and_populate_channels(room_id);
    //console.log(room);
    user.rooms.remove({ _id: room_id });
    room.users.remove({ _id: user._id });
    room.userCount = room.userCount - 1;
    for (var i = 0; i < room.channels.length; i++) {
      if (room.channels[i].users.includes(user._id)) {
        let user_channels = await find_channel_by_id(room.channels[i]);
        user_channels.users.remove({ _id: user._id });
        user_channels.save();
      }
    }
    //console.log(room);
    await user.save();
    await room.save();
    res.json({ message: "Successfully deleted!" });
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/room/:room")
  .get(async (req, res) => {
    // Get room details and all channels of the current user
    let room_detail = await find_room_by_id_and_populate_channels(
      req.params.room
    );
    let user = await find_user_by_email(req.user.email);
    let user_present = room_detail.channels.map((channel) => {
      return channel.users.includes(user._id);
    });

    res.json({ room_detail, user_present });
  })
  .delete(async (req, res) => {
    // Remove the user from that channel
    let channel_id = req.body.channel_id;
    let channel = await find_channel_by_id(channel_id);
    let user = await find_user_by_email(req.user.email);
    channel.users.remove({ _id: user._id });
    channel.save();
    res.json({ message: "Successfully deleted!" });
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .route("/room/:room/add_channel")
  .post(async (req, res) => {
    // Add channel in the particular room
    let channelinfo = req.body.data.userinfo;
    let user = await find_user_by_email(req.user.email);
    let room = await find_room_by_id_and_populate_channels(req.params.room);
    let channel = create_new_channel();

    channel.name = channelinfo.name;
    // Check whether the channel is a meet channel or a normal channel
    if (channelinfo.is_meet == false) {
      // If false then it is a normal channel
      channel.is_meet = false;
      channel.users.push(user);

      for (var i = 0; i < channelinfo.users.length; i++) {
        let user_to_add = await find_user_by_email(channelinfo.users[i]);
        if (user_to_add) {
          let user_present =
            room.users.includes(user_to_add._id) &&
            !channel.users.includes(user_to_add._id);
          if (user_present && user.id != user_to_add.id) {
            channel.users.push(user_to_add);
            user_to_add.save();
          }
        }
      }
      room.channels.push(channel);
      room.save();
    } else {
      // Else it is a meet channel
      let parent_channel = await find_channel_by_id(channelinfo.channel_id);
      parent_channel.meets.push(channel);
      channel.is_meet = true;
      channel.meet_allow_students_stream = channelinfo.allow_students_stream;
      channel.meet_link = `/room/${room._id}/meetroom/${parent_channel._id}/meet/${channel._id}`;
      parent_channel.save();
      channel.start_date = req.body.data.date;
      channel.start_time = req.body.data.time;
    }

    channel.save();
    //console.log(channel);
    user.save();
    res.json(channel);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .get("/get_popular_rooms/", async (req, res) => {
    const rooms = await get_popular_rooms();
    res.json(rooms);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .get("/get_oldest_rooms/", async (req, res) => {
    const rooms = await get_oldest_rooms();
    res.json(rooms);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .get("/get_latest_rooms/", async (req, res) => {
    const rooms = await get_latest_rooms();
    res.json(rooms);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .get("/get_most_liked_rooms/", async (req, res) => {
    const rooms = await get_most_liked_rooms();
    res.json(rooms);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .post("/room/:room_id/toggle_like", async (req, res) => {
    let room = await find_room_by_id(req.params.room_id);
    if (room.likes.includes(req.user._id)) {
      room.likeCount -= 1;
      room.likes.remove({ _id: req.user._id });
    } else {
      room.likeCount += 1;
      room.likes.push(req.user._id);
    }
    room.save();
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
router
  .post("/room/:room_id/join", async (req, res) => {
    //console.log(req.user);
    let room = await find_room_by_id(req.params.room_id);
    let user = await find_user_by_email(req.user.email);
    if (!room.users.includes(user._id)) {
      room.userCount += 1;
      room.users.push(req.user._id);
      user.rooms.push(room._id);
      let channel = await find_channel_by_id(room.channels[0]);
      channel.users.push(user._id);
      channel.save();
      room.save();
      user.save();
    } else {
      //console.log("here");
      res.send("Already in the room");
    }
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router
  .route("/get_set_stream_id")
  .post(async (req, res) => {
    let details = req.body.data;
    let newstream = await new Streams(); // Set stream details
    newstream.user = details.user;
    newstream.useremail = details.useremail;
    newstream.userid = details.userid;
    await newstream.save();
    res.json(newstream);
  })
  .get(async (req, res) => {
    // Get stream details
    let users = await Streams.find({ userid: req.query.userid });
    let user = users[users.length - 1];
    res.json(user);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const removeAddUserFromTags = async (user, tag) => {
  let userIndex = tag.users.indexOf(user.email);
  let tagIndex = user.tags.indexOf(tag.name);
  if (userIndex != -1) {
    tag.users.splice(userIndex, 1);
  } else {
    tag.users.push(user.email);
  }
  if (tagIndex != -1) {
    user.tags.splice(tagIndex, 1);
  } else {
    user.tags.push(tag.name);
  }

  await tag.save();

  return "successful";
};
// const removeAddRoomsFromTags = async(room, tag) => {
// 	let roomIndex = tag.rooms.indexOf(room._id);
//   let tagIndex = room.tags.indexOf(tag.name);
// 	if (roomIndex != -1) {
// 		tag.rooms.splice(roomIndex, 1);
// 	} else {
// 		tag.rooms.push(room._id);
// 	}

//    if (tagIndex != -1) {
// 			room.tags.splice(tagIndex, 1);
// 		} else {
// 			room.tags.push(tag.name);
//   }

//   await tag.save();

//   return "successful";
// };
// router.route("/set_user_profile").post(async (req, res) => {

//   await tag.save();

//   return "successful";

// });

router.route("/set_user_profile").post(async (req, res) => {
  let user = await find_user_by_email(req.user.email);
  let tags = req.body.tags;
  if (tags) {
    let removeTags = user.tags.filter((tag) => {
      return !tags.includes(tag);
    });
    let addTags = tags.filter((tag) => {
      return !user.tags.includes(tag);
    });
    // console.log('remove - ', removeTags);
    // console.log('add - ', addTags);
    for (let i = 0; i < removeTags.length; i++) {
      let removeTag = await get_tag_by_name(removeTags[i]);
      await removeAddUserFromTags(user, removeTag);
    }

    for (let i = 0; i < addTags.length; i++) {
      let addTag = await get_tag_by_name(addTags[i]);

      if (!addTag) {
        addTag = await create_new_tag(addTags[i]);
      }
      await removeAddUserFromTags(user, addTag);
    }
  }
  user.profilepicUrl = req.body.profilepicUrl;
  req.user.profilepicUrl = req.body.profilepicUrl;
  user.about = req.body.about;
  if (req.body.idUrl) {
    user.idUrl = req.body.idUrl;
  }
  await user.save();
  // console.log(user)

  return res.send("successfully data received");
});
router.route("/user/logged").get(async (req, res) => {
  try {
    let user = await find_user_by_email(req.user.email);
    return res.json(user);
  } catch (err) {
    res.json(err);
  }
});
router.route("/user/:email").get(async (req, res) => {
  try {
    let user = await find_user_by_email(req.params.email);
    return res.json(user);
  } catch (err) {
    res.json(err);
  }
});
router.post("/course_request", async (req, res) => {
  let data = req.body;
  let request = new CourseRequest();
  request.name = data.name;
  request.requirements = data.requirements;
  request.tags = data.tags;
  request.user = req.user._id;
  await request.save();
  res.json("Success!");
});
router.get("/all_requests", async (req, res) => {
  let all_requests = await CourseRequest.find().populate("user");
  return res.json({ all_requests, tags: req.user.tags });
});
router.get("/get_req_data/:id", async (req, res) => {
  let req_data = await CourseRequest.findById(req.params.id);
  //console.log(req_data);
  res.json(req_data);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/get_tracker_data/", async (req, res) => {
  let req_data = await Tracker.find({ user: req.user._id });
  res.json(req_data);
});
router.get("/get_course_tracker_data/:id", async (req, res) => {
  let req_data = await Tracker.find({
    course: req.params.id,
    user: req.user._id,
  });
  let course = await find_room_by_id(req.params.id);
  res.json({ req_data, course });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.route("/search").post(async (req, res) => {
  let allTags = await get_all_tags();
  //console.log(allTags)
  let findTags = req.body.findTags;
  // console.log(findTags);
  let users = new Map();
  let rooms = new Map();
  let foundTags = [];
  for (let j = 0; j < allTags.length; j++) {
    for (let i = 0; i < findTags.length; i++) {
      if (allTags[j].name.includes(findTags[i])) {
        foundTags.push(allTags[j]);
        break;
      }
    }
  }
  for (let i = 0; i < foundTags.length; i++) {
    let tag = foundTags[i];
    //console.log("yahoo! found tag " + tag.name);
    for (let i = 0; i < tag.users.length; i++) {
      let email = String(tag.users[i]);
      let user = users.get(email);
      let userData = await find_user_by_email(email);
      // console.log(user,id)
      if (!user) {
        users.set(email, { user: userData, count: 1 });
      } else {
        users.set(email, { user: userData, count: user.count + 1 });
      }
    }
    //console.log(tag.rooms)
    for (let i = 0; i < tag.rooms.length; i++) {
      let id = String(tag.rooms[i]);
      let room = rooms.get(id);
      let roomData = await find_room_by_id(id);
      // console.log('roomdata', roomData);
      if (!room) {
        rooms.set(id, { room: roomData, count: 1 });
      } else {
        rooms.set(id, { room: roomData, count: room.count + 1 });
      }
    }
  }
  let usersArr = [...users.values()];
  let roomsArr = [...rooms.values()];
  // console.log(x);
  // console.log(rooms);
  usersArr.sort((a, b) => {
    return b.count - a.count;
  });
  roomsArr.sort((a, b) => {
    return b.count - a.count;
  });
  // console.log(x);

  return res.json({
    users: usersArr,
    rooms: roomsArr,
  });
});

router.post("/create_poll", async (req, res) => {
  let data = req.body;
  let option_ids = [];
  for (let i = 0; i < data.options.length; i++) {
    let option = await create_new_option(data.options[i]);
    option_ids.push(option._id);
  }
  const poll = await create_new_poll(
    data.name,
    option_ids,
    data.type,
    data.channel_id
  );
  res.json(poll);
});
router.post("/update_vote", async (req, res) => {
  const poll = await update_vote(req.body.id, req.body.options, req.user);
  res.json(poll);
});

router.get("/get_poll/:poll", async (req, res) => {
  const poll = await find_poll_by_id(req.params.poll);
  res.json(poll);
});

router.get("/get_files/", async (req, res) => {
  try {
    const files = await File.find({ _id: { $in: req.query.files } }).populate(
      "createdBy"
    );
    res.json(files);
  } catch (err) {
    res.status(500).json(err);
  }
});
router
  .route("/message")
  .post(async (req, res) => {
    //console.log(req.body);

    if (req.body.channel_id != -1) {
      let Channel = await find_channel_by_id(req.body.channel_id);
      let new_message = create_new_chat(
        req.body.user_name,
        req.body.message,
        req.body.email,
        req.body.timestring,
        req.body.type
      );
      Channel.messages.push(new_message.id);
      await Channel.save();

      res.json(new_message._id);
    }
  })
  .delete(async (req, res) => {
    //console.log(req.body);

    await delete_chat(req.body.message_id);

    res.json("Deleted");
  })
  .put(async (req, res) => {
    await edit_chat(
      req.body.message_id,
      req.body.message_content,
      req.body.message_timestamp
    );
  });

exports.router = router;
