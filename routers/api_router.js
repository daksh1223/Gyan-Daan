const router = require("express").Router();
const Streams = require("../Schemas/StreamSchema");
const CourseRequest = require("../Schemas/CourseRequestSchema");
const Tracker = require("../Schemas/TrackerSchema");
const {
  find_user_by_email,
  get_user_rooms,
  get_all_users,
  get_user_by_id_and_populate_Rooms,
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
  .route("/get_users") // Will fetch all the users present in the true-meet organization.
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
            console.log(room.users, user_to_remove._id);
            room.users = room.users.filter((user) => {
              return user != String(user_to_remove._id);
            });
            console.log(room.users);
            for (let i = 0; i < room.channels.length; i++) {
              console.log(all_channels[i].users);
              all_channels[i].users = all_channels[i].users.filter(
                (user) => user != String(user_to_remove._id)
              );
              console.log(all_channels[i].users);
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
    res.json(channel_details);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router
  .route("/room") // Will be called to delete a room
  .delete(async (req, res) => {
    let room_id = req.body.room_id;

    let user = await find_user_by_email(req.user.email);
    let room = await find_room_by_id_and_populate_channels(room_id);
    console.log(room);
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
    console.log(room);
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
    }

    channel.save();
    console.log(channel);
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
    console.log(req.user);
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
      console.log("here");
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

router.post("/course_request", async (req, res) => {
  let data = req.body;
  let request = new CourseRequest();
  request.name = data.name;
  request.requirements = data.requirements;
  request.tags = data.tags;
  await request.save();
  res.json("Success!");
});
router.get("/all_requests", async (req, res) => {
  let all_requests = await CourseRequest.find();
  return res.json(all_requests);
});
router.get("/get_req_data/:id", async (req, res) => {
  let req_data = await CourseRequest.findById(req.params.id);
  console.log(req_data);
  res.json(req_data);
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/get_tracker_data/", async (req, res) => {
  let req_data = await Tracker.find({ user: req.user._id });
  res.json(req_data);
});
router.get("/get_course_tracker_data/:id", async (req, res) => {
  let req_data = await Tracker.find({ course: req.params.id });
  let course = await find_room_by_id(req.params.id);
  res.json({ req_data, course });
});

exports.router = router;
