const router = require("express").Router();
const authentication_controller = require("../controllers/authentication_controller");

router
  .route("/")
  .get(async (req, res) => { // The starting point of the website i.e. the authentication page.
    const response = await authentication_controller.authenticate();
    res.redirect(response.response);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/redirect")
  .get(async (req, res) => { 
    // After authentication we will be redirected to the redirect page which will then again redirect it back to the required page.
    const response = await authentication_controller.redirect_request(
      req.session.redirect_url,
      req.query.code
    );
    req.user = response.user;
    res.redirect(response.redirect_url);
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

router
  .route("/logout")
  .get((req, res) => {
    // After logout completion we will be redirected to the logout page.
    // Destroy the session here and again redirect back to the starting point i.e. authentication 
    req.session.destroy();
    res.redirect("/");
  })
  .all((req, res) => {
    res.send(`${req.method} method is not allowed!`);
  });

exports.router = router;
