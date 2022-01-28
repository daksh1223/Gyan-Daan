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
const passport = require("passport");
const multerAzure = require("multer-azure");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const bodyParser = require("body-parser");

const adminbro = require("./adminbro");
const User = require("./Schemas/UserSchema.js");
const { find_channel_by_id } = require("./Repository/channel_repository");
const {
  get_tag_by_name,
  create_new_tag,
} = require("./Repository/tag_repository.js");
const { find_user_by_email } = require("./Repository/user_repository");
const home_page_router = require("./routers/home_router");
const room_page_router = require("./routers/room_router");
const api_router = require("./routers/api_router");
const File = require("./Schemas/FileScema");
const Tracker = require("./Schemas/TrackerSchema");
require("dotenv").config();
const dburl = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.set("view engine", "ejs");
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(express.static("public"));
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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
app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      let user = await find_user_by_email(profile.email);
      if (!user) {
        user = await User.create({
          email: profile.email,
          name: profile.displayName,
        });
        addUserNameTag(user, profile.displayName);
      }
      return done(null, user);
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      callbackURL: process.env.MICROSOFT_CALLBACK,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      scope: ["openid", "profile", "email"],
    },
    async (request, accessToken, refreshToken, profile, done) => {
      let user = await find_user_by_email(profile.emails[0].value);
      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
        });
        addUserNameTag(user, profile.displayName);
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
app.post("/auth/google", (req, res, next) => {
  req.session.isEducator = req.body.isEducator === "true";
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })(req, res, next);
});
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/",
  })
);

app.post("/auth/microsoft", (req, res, next) => {
  req.session.isEducator = req.body.isEducator === "true";
  passport.authenticate("microsoft", {
    scope: ["openid", "profile", "email"],
  })(req, res, next);
});
app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", {
    successRedirect: "/home",
    failureRedirect: "/",
  })
);
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/home");
  } else res.render("login.ejs");
});

app.use("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user_name = req.user.name;
    res.locals.user_email = req.user.email;
    res.locals.isEducator = req.session.isEducator;
    res.locals.isAdmin = req.user.isAdmin;
    res.locals.userId = req.user._id;
    res.locals.user_profilePic = req.user.profilepicUrl;
    res.locals.user_isVerified = req.user.isVerified;
    return next();
  }

  req.session.redirect_url = req.url;
  res.redirect("/");
};
app.use(checkAuthenticated);
/////////////////////////////// Authentication End ///////////////////////////////////////

app.use("/home", home_page_router.router);
app.use("/room", room_page_router.router);
app.use("/api", api_router.router);
app.get("/profile/:email", async (req, res) => {
  res.render("profile", { email: req.params.email });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const upload = multer({
  storage: multerAzure({
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING, //Connection String for azure storage account, this one is prefered if you specified, fallback to account and key if not.
    account: process.env.AZURE_STORAGE_ACCOUNT, //The name of the Azure storage account
    key: process.env.AZURE_STORAGE_ACCESS_KEY, //A key listed under Access keys in the storage account pane
    container: process.env.AZURE_STORAGE_CONTAINER, //Any container name, it will be created if it doesn't exist
    blobPathResolver: function (req, file, callback) {
      const ext = file.mimetype.split("/")[1];
      var blobPath = `${file.fieldname}-${Date.now()}.${ext}`; //Calculate blobPath in your own way.
      callback(null, blobPath);
    },
  }),
});

app.get("/donate", (req, res) => {
  res.render("Donate");
});
app.get("/Requested-Courses", (req, res) => {
  if (req.session.isEducator) res.render("Requested-Courses");
  else res.render("permission_denied");
});
app.get("/course-tracker/:id", (req, res) => {
  let id = req.params.id;
  if (!req.session.isEducator) res.render("course_tracker", { id });
  else res.render("permission_denied");
});
app.get("/tracker", (req, res) => {
  if (!req.session.isEducator) res.render("tracker");
  else res.render("permission_denied");
});
app.post("/api/uploadFile", upload.single("upload"), async (req, res) => {
  // Stuff to be added later
  try {
    const newFile = await File.create({
      name: req.file.blobPath,
      path: req.file.url,
      displayName: req.file.originalname,
      createdBy: req.user._id,
    });

    if (req.body.channelID) {
      const channel = await find_channel_by_id(req.body.channelID);
      if (req.body.isRecording === "true") channel.recordings.push(newFile);
      else channel.files.push(newFile);
      channel.save();
    }

    res.send(newFile);
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

io.on("connection", (socket) => {
  socket.on(
    "join-room",
    (roomID, user, email, userID, profile_pic, educator_status, channelId) => {
      socket.join(roomID);
      let new_track_record = new Tracker();
      new_track_record.user = userID;
      new_track_record.course = roomID;
      new_track_record.StartTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      socket.on("connect_to_new_user", (username, id) => {
        socket
          .to(id)
          .emit(
            "user-joined",
            user,
            email,
            id,
            profile_pic,
            educator_status,
            channelId
          );
      });
      socket.on(
        "notification_message",
        (type, id, title, content, timestamp, current_channel) => {
          socket.broadcast
            .to(roomID)
            .emit(
              "receive_notification_message",
              type,
              id,
              title,
              content,
              timestamp,
              current_channel
            );
        }
      );
      socket.on("toggle_option", (poll) => {
        socket.broadcast.to(roomID).emit("update_poll", poll);
      });

      socket.broadcast
        .to(roomID)
        .emit(
          "user-joined",
          user,
          email,
          socket.id,
          profile_pic,
          educator_status,
          channelId
        );
      socket.on(
        "receive_channel_message",
        async (
          username,
          data,
          email,
          channel_id,
          message_id,
          timestring,
          type
        ) => {
          socket.broadcast
            .to(roomID)
            .emit(
              "send_channel_message",
              username,
              data,
              timestring,
              channel_id,
              message_id,
              email,
              type
            );
        }
      );
      socket.on("deleteChat", async (message_id) => {
        socket.broadcast.to(roomID).emit("deleteChat", message_id);
      });
      socket.on("editChat", async (message_id, newData, timeString) => {
        socket.broadcast
          .to(roomID)
          .emit("editChat", message_id, newData, timeString);
      });
      socket.on("disconnect", () => {
        new_track_record.EndTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
        new_track_record.duration =
          (new_track_record.EndTime.getTime() -
            new_track_record.StartTime.getTime()) /
          1000;
        new_track_record.save();
        socket.to(roomID).broadcast.emit("user-disconnected", email, channelId);
      });
    }
  );
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
const addUserNameTag = async (user, name) => {
  let addTag = await get_tag_by_name(name);

  if (!addTag) {
    addTag = await create_new_tag(name);
  }
  addTag.users.push(user.email);
  user.tags.push(addTag.name);
  await addTag.save();
  await user.save();
};
