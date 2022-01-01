const Channels = require("../Schemas/ChannelSchema");
const Rooms = require("../Schemas/RoomSchema");
const token_builder = require("../controllers/agora-token-builder");
const { find_user_by_email } = require("../Repository/user_repository");
const { find_channel_by_id } = require("../Repository/channel_repository");
const router = require("express").Router();

router.use("/:room", async (req, res, next) => {
  // Before going to a particular page, this middleware will always check whether that person is present in the room or not.
  let user = await find_user_by_email(req.user.email);
  Rooms.findById(req.params.room)
    .then((room) => {
      if (!room.users.includes(user._id)) res.render("permission_denied"); // If the user is not present
      else {
        // If the user is present
        next();
      }
    })
    .catch((err) => {
      // If that room doesn't exist.
      res.render("404");
    });
});

router
  .route("/:room")
  .get((req, res) => {
    res.render("room", { room_id: req.params.room }); // Render the room and pass the room_id with it.
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/:room/meetroom/:channel/meet/:meetid")
  .get(async (req, res) => {
    let user = await find_user_by_email(req.user.email);
    let channel = await find_channel_by_id(req.params.channel);

    if (channel.users.includes(user._id)) { // Check whether the current user is present in the channel or not
      if (channel.meets.includes(req.params.meetid)) { // Check whether that meet is present in the channel
        let token_values = token_builder(req.params.meetid); // Generate access tokens required to join the video call
        let user = req.user.name; // If user has logged in
        if (!user) user = "Anonymous"; 
        let meet=await find_channel_by_id(req.params.meetid);
        res.render("videoroom", { // Render the video room with other parameters alongside.
          ROOMID: req.params.room,
          user: user,
          uid: token_values.uid,
          screenuid: token_values.screenuid,
          agoraAppId: token_values.Agora_app_ID,
          channelName: req.params.meetid,
          token: token_values.token,
          screentoken: token_values.screentoken,
          allow_students_stream: meet.meet_allow_students_stream
        });
      } else {
        res.render("404"); //If meet doesn't exist
      }
    } else {
      res.render("permission_denied"); // If user is not present in the channel
    }
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

exports.router = router;
