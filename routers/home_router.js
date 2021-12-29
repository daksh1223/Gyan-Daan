const router = require("express").Router();
const home_controller = require("../controllers/home_controller");


router
  .route("/")
  .get(async (req, res) => {
    res.render("home");
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/add_room")
  .post(async (req, res) => {
    // Create the room using the create room function and then return that room in JSON format.
    if (req.session.user.isEducator) {
      const room = await home_controller.create_room(
        req.body.data.roominfo,
        req.session.user
      );
      res.json(room);
    } else res.json("Permission Denied!");
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

exports.router = router;
