const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose_morgan = require("mongoose-morgan");
const favicon = require("serve-favicon");

const adminbro = require("./adminbro");
const { find_channel_by_id } = require("./Repository/channel_repository");
const { create_new_chat } = require("./Repository/chat_repository");
const authentication = require("./routers/authentication_router");
const home_page_router = require("./routers/home_router");
const room_page_router = require("./routers/room_router");
const api_router = require("./routers/api_router");

require("dotenv").config();
const dburl = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

app.use(function (req, res, next) {
  if (req.session.user) {
    res.locals.user_name = req.session.user.name; // With this one can directly access usrname and email id in the frontend
    res.locals.user_email = req.session.user.email;
    res.locals.isEducator = req.session.user.isEducator;
  }
  next();
});

app.use(["/", "/redirect"], authentication.router);
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.redirect_url = req.url;
    res.redirect("/");
  } else {
    req.session.redirect_url = null;
    next();
  }
});
app.use("/logout", authentication.router);
app.use("/home", home_page_router.router);

app.use("/room", room_page_router.router);
app.use("/api", api_router.router);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
          console.log(Channel);
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
  return req.session && req.session.user ? req.session.user.email : undefined;
});
mongoose_morgan.token("remote-addr", function (req, res, params) {
  return req.session && req.session.user ? req.session.user.name : undefined;
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
