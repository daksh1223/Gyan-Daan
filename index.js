const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose_morgan = require("mongoose-morgan");
const multer = require("multer");
const favicon = require("serve-favicon");
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;

const adminbro = require("./adminbro");
const User = require("./Schemas/UserSchema.js");
const { find_channel_by_id } = require("./Repository/channel_repository");
const { create_new_chat } = require("./Repository/chat_repository");
const { find_user_by_email } = require("./Repository/user_repository");
const home_page_router = require("./routers/home_router");
const room_page_router = require("./routers/room_router");
const api_router = require("./routers/api_router");
const File = require("./Schemas/FileScema");

require("dotenv").config();
const dburl = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let count = 1;
app.set("view engine", "ejs");
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(express.static("public"));
app.use(cors());

app.use(mongoose_morgan({ connectionString: dburl }, {}, "short"));
app.use(
  session({
    secret: "fsdcscdsvsdsdg",
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: dburl,
      crypto: {
        secret: "frywertvevtwete",
      },
    }),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/////////////////////////////// Authentication Start ///////////////////////////////////////
app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  let user = await find_user_by_email(profile.email)
  if (!user) {
      user = await User.create({email:profile.email, name: profile.displayName})
  }
  return done(null, user);
}));

passport.use(new MicrosoftStrategy({  
callbackURL: process.env.MICROSOFT_CALLBACK,  
clientID: process.env.MICROSOFT_CLIENT_ID,  
clientSecret: process.env.MICROSOFT_CLIENT_SECRET,  
scope: ['openid', 'profile', 'email']  
}, async (request, accessToken, refreshToken, profile, done) => {
    let user = await find_user_by_email(profile.emails[0].value)
    if (!user) {
      user = await User.create({ email: profile.emails[0].value, name: profile.displayName })
  }
    return done(null, user)
}))

passport.serializeUser((user, done) => {
  done(null, user)
})
passport.deserializeUser((user, done) => {
  done(null, user)
})
app.post('/auth/google', (req, res, next) => {
  req.session.isEducator = (req.body.isEducator==='true')
  passport.authenticate('google', {
    scope:
      ['email', 'profile']
  }
  )(req,res,next)
}
);
app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/'
  })(req,res,next)
});
app.post('/auth/microsoft', (req, res, next) => {
  req.session.isEducator = (req.body.isEducator==='true')
  passport.authenticate('microsoft', {
    scope:
      ['openid', 'profile', 'email']
  } 
  )(req,res,next)
}
);
app.get('/auth/microsoft/callback',
  passport.authenticate('microsoft', {
    successRedirect: '/home',
    failureRedirect: '/'
  }));
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/home')
  }
  else res.render("login.ejs")
})

app.use("/logout", (req, res) => {
  req.logOut()
  res.redirect("/")
});
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user_name = req.user.name
    res.locals.user_email = req.user.email
    res.locals.isEducator = req.session.isEducator
    res.locals.isAdmin = req.user.isAdmin
    res.locals.userId = req.user._id
    return next()
  }
  req.session.redirect_url = req.url
  res.redirect("/")
}
app.use(checkAuthenticated)
/////////////////////////////// Authentication End ///////////////////////////////////////

app.use("/home", home_page_router.router);
app.use("/room", room_page_router.router);
app.use("/api", api_router.router);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  }
});
const upload = multer({
  storage: multerStorage,
});
app.get("/donate", (req, res) => {
  res.render("Donate");
});
app.post("/api/uploadFile", upload.single("upload"), async (req, res) => {
  // Stuff to be added later
  try {
    const newFile = await File.create({
      name: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      displayName: req.file.originalname
    });
    res.send(newFile);
  } catch (error) {
    res.json({
      error,
    });
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, user, email) => {
    socket.join(roomID);

    socket.on("connect_to_new_user", (username, id) => {
      socket.to(id).emit("user-joined", user, email, id);
    });

    socket.broadcast.to(roomID).emit("user-joined", user, email, socket.id);
    socket.on(
      "receive_channel_message",
      async (username, data, email, channel_id) => {
        var timestring = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });

        if (channel_id != -1) {
          var Channel = await find_channel_by_id(channel_id);
          let new_message = create_new_chat(username, data, email, timestring);
          Channel.messages.push(new_message.id);
          Channel.save();
        }
        socket.broadcast
          .to(roomID)
          .emit("send_channel_message", username, data, timestring, channel_id);
      }
    );
    socket.on("disconnect", () => {
      socket.to(roomID).broadcast.emit("user-disconnected", email);
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mongoose
  .connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("Connected to the database!");
    app.use(
      adminbro.rootPath,
      (req, res, next) => adminbro.admin_checker(req, res, next),
      adminbro.router_builder(result)
    );
    app.use("/", (req, res) => {
      res.render("404");
    });
    server.listen(PORT, () => {
      console.log("Server connected to port " + PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

mongoose_morgan.token("remote-user", function (req, res, params) {
  return req.session && req.user ? req.user.email : undefined;
});
mongoose_morgan.token("remote-addr", function (req, res, params) {
  return req.session && req.user ? req.user.name : undefined;
});
mongoose_morgan.token("status", function (req, res, params) {
  if (req.method == "GET" || req.method == "PUT") {
    return 200;
  }
  if (req.method == "POST") {
    return 201;
  }
  if (req.method == "DELETE") {
    return 204;
  }
});
mongoose_morgan.token("res", function (req, res, params) {
  return new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
});
