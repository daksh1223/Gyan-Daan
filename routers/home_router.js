const router = require("express").Router();
const home_controller = require("../controllers/home_controller");

router
  .route("/")
  .get(async (req, res) => {
    if (req.session.redirect_url) {
      const redirect_url = req.session.redirect_url
      req.session.redirect_url = null
      res.redirect(redirect_url)
    }
    else res.render("home");
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/add_room")
  .post(async (req, res) => {
    // Create the room using the create room function and then return that room in JSON format.
    console.log(req.user)
    if (req.user.isEducator) {
      const room = await home_controller.create_room(
        req.body.data.roominfo,
        req.user
      );
      res.json(room);
    } else res.json("Permission Denied!");
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

exports.router = router;
