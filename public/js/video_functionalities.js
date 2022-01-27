var camera_video_profile = "480p_4"; // 640 × 480 @ 30fps  & 750kbs
var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }); // Create a Agora client instance for camera and screen share
var screenClient;
var remote_streams = {}; // Will keep a track of active stream  and will store it in the form of [id:stream]
var pinned_user;
var local_streams = {
  //Will store the streams and ids of camera as well as the screen
  camera: {
    id: "",
    stream: {},
  },
  screen: {
    id: "",
    stream: {},
  },
};

AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.verbose); // Set the type of logging required

var screen_share_checker = false; // Check whether screen sharing is currently enabled or not

function Initialize_client_and_join_the_channel() {
  client.init(
    //Initialize the Agora SDK
    agoraAppId,
    function () {
      Join_Channel_On_Initialization(channelName, uid, token); // join channel upon successfull init
    },
    function (err) {
      console.log(err);
    }
  );
}

Initialize_client_and_join_the_channel();

// If remote stream is not user's own screen then it will subscribe to that stream
client.on("stream-added", function (evt) {
  var remote_stream = evt.stream;
  var streamId = remote_stream.getId();

  // Check whether it is user's own stream or not
  if (streamId != local_streams.screen.id) {
    // If not then subscribe to the stream.
    client.subscribe(remote_stream, function (err) {
      console.log(err);
    });
  }
});

// When the stream is successfully subscribed then add the stream to the videos container and resize it.
client.on("stream-subscribed", async function (evt) {
  var remote_stream = evt.stream;
  var streamId = remote_stream.getId();

  remote_streams[streamId] = remote_stream;
  var response = await add_stream_to_container(remote_stream);
  resize(); // Will resize the videos container
});

// Remove the remote stream when a user leaves the channel
client.on("peer-leave", function (evt) {
  var streamId = evt.stream.getId(); // Stream ID
  if (remote_streams[streamId] != undefined) {
    // If the relation exists in the remote_streams
    remote_streams[streamId].stop(); // Stop playing the stream's feed
    // console.log(pinned_user,streamId)
    if(pinned_user==streamId) {remove_pinned_user(streamId);}
    delete remote_streams[streamId]; // Then remove the relationship from the remote_streams
    var remote_stream_container_ID = "#" + streamId + "_container";
    $(remote_stream_container_ID).empty().remove(); // Empty and then remove the remote stream from the container
    resize(); // After removing it resize the videos container again
  }
});

// Show mute icon whenever a remote user mutes his/her mic
client.on("mute-audio", function (evt) {
  toggleVisibility(evt.stream, evt.uid + "_mute", true);
});
// Show unmute icon whenever a remote user unmutes his/her mic
client.on("unmute-audio", function (evt) {
  toggleVisibility(evt.stream, evt.uid + "_mute", false);
});

// Will join the channel
function Join_Channel_On_Initialization(channelName, uid, token) {
  client.join(
    token,
    channelName,
    uid,
    function (uid) {
      if (allow_students_stream != "false" || isEducator != "false") {
        add_camera_stream(uid);
        local_streams.camera.id = uid; // Set the id of camera stream in the local_streams
      }
    },
    function (err) {
      console.log(err);
    }
  );
}

async function add_camera_stream(uid) {
  var localStream = AgoraRTC.createStream({
    // Create a new stream which will have video and audio of the user
    streamID: uid,
    audio: true,
    video: true,
    screen: false,
  });

  localStream.setVideoProfile(camera_video_profile); // Set the video profile of this stream
  localStream.init(
    async function () {
      await axios.post("/api/get_set_stream_id", {
        // Store the username and useremail corresponding to this stream in the database.
        data: {
          // It will be called again to get the name corresponding to this stream.
          user: user__name,
          useremail: user__email,
          userid: localStream.params.streamID,
        },
      });

      await add_stream_to_container(localStream);
      resize(); // Resize after adding the stream to the container

      client.publish(localStream, function (err) {
        // Then publish stream so that other users can connect to it.
        console.log(err);
      });

      enableUiControls(localStream); // Enable additional UI functionalities when the stream gets added to the container

      local_streams.camera.stream = localStream; // Set the stream of the camera stream in the local_streams

      document.getElementById("mic-btn").click();
      document.getElementById("mic-btn").click();
    },
    function (err) {
      // If not able to connect to the camera stream
      document
        .getElementById("video-icon")
        .innerHTML="videocam_off";
      document
        .getElementById("screen-share-icon")
        .innerHTML="stop_screen_share";
     
      alert(
        "Please provide appropriate permissions to share your video and screen!" // Send a alert message to the user that provide permissions to add his/her stream
      );
    }
  );
}

function initialize_screen_share(agoraAppId, channelName) {
  screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  screenClient.init(
    // Initialize the screen share client
    agoraAppId,
    function () {},
    function (err) {
      console.log(err);
    }
  );

  local_streams.screen.id = screenuid; // Set the id of the screen stream in the local_stream

  var screenStream = AgoraRTC.createStream({
    // Create a new stream for the screen share
    streamID: screenuid,
    audio: false,
    video: false,
    screen: true, // screen share
    screenAudio: true,
    mediaSource: "screen",
  });
  screenStream.init(
    // Initialize the screen share stream
    function () {
      local_streams.screen.stream = screenStream; // Set the stream of the screen share stream in the local_streams
      screen_share_checker = true;
      $("#screen-share-btn").prop("disabled", false); // Enable the button

      screenClient.join(
        screentoken,
        channelName,
        screenuid,
        function (uid) {
          screenClient.publish(screenStream, function (err) {
            // Publish this stream so that remote users can subscribe to it
            console.log(err);
          });
        },
        function (err) {
          console.log(err); // Join channel as screen-share failed
        }
      );
    },
    function (err) {
      console.log(err); // Unable to get the screen stream
      local_streams.screen.id = "";
      local_streams.screen.stream = {}; // reset the screen stream and screen id
      screen_share_checker = false; // Set it as false as there is no active screen share by the user
      toggleScreenShareBtn(); // Toggle the button back
      $("#screen-share-btn").prop("disabled", false); // Enable the button
    }
  );
  screenClient.on("stream-published", async function (evt) {
    // When screen stream gets successfully published
    remote_streams[screenuid] = evt.stream;
    var response = await axios.post("/api/get_set_stream_id", {
      // Add the username,useremail and stream id in the database
      data: {
        user: user__name,
        useremail: user__email,
        userid: evt.stream.params.streamID,
      },
    });

    var response = await add_stream_to_container(evt.stream); // Add this stream in the container
  });

  screenClient.on("stopScreenSharing", function (evt) {
    console.log("screen sharing stopped", err);
  });
}

function stopScreenShare() {
  local_streams.screen.stream.disableVideo(); // Disable the user's screem stream (will send a mute signal)
  local_streams.screen.stream.stop(); // Stop playing the screen stream

  $("#video-btn").prop("disabled", false);
  screenClient.leave(
    function () {
      screen_share_checker = false; // Set it to false as no active screen share is present
      $("#screen-share-btn").prop("disabled", false); // Enable the button
      local_streams.screen.stream.stop(); // Stop playing the screen stream
      screenClient.unpublish(local_streams.screen.stream); // Unpublish the screen stream client
      local_streams.screen.stream.close(); // Then close this stream
      local_streams.screen.id = "";
      local_streams.screen.stream = {}; // Reset the id and stream of screen stream in the local stream as "" as no active screen share is present
    },
    function (err) {
      console.log(err); //If the client is unable to leave
    }
  );
}
let all_streams={};
async function add_stream_to_container(remoteStream) {
  // Adding the stream in the container
  var streamId = remoteStream.getId();
  var response = await axios.get("/api/get_set_stream_id", {
    // Get the username corresponding to the stream from the database
    params: {
      userid: remoteStream.params.streamID,
    },
  });
  let video_grid_container = document.getElementById("video-grid"); // Videos container

  all_streams[streamId]= remoteStream;
  let remote_stream_container = document.createElement("div");
  remote_stream_container.setAttribute("id", streamId + "_container");
  remote_stream_container.setAttribute("class", "remote-stream-container");

  let usernameaudio = document.createElement("div"); // To store the name and audio state of the user
  usernameaudio.setAttribute("display", "flex");
  usernameaudio.setAttribute("flex-direction", "column");
  usernameaudio.setAttribute("z-index","inherit");
  let fas_icon = document.createElement("i");
  fas_icon.setAttribute("id", streamId + "_mute");
  fas_icon.setAttribute("class", "fas fa-microphone-slash mute");
  usernameaudio.appendChild(fas_icon);

  let username = document.createElement("div");
  username.setAttribute("class", "username");
  username.innerHTML = response.data.user; // Set this div's innerHTML as the name of the user
  usernameaudio.appendChild(username);

  remote_stream_container.appendChild(usernameaudio);
  let userstream_container = document.createElement("div");
  userstream_container.setAttribute("id", streamId + "_container" + "_video");
  userstream_container.setAttribute("class", "video__container");
  let pinicon = document.createElement("i");
  pinicon.setAttribute("class", "fas fa-thumbtack pin_icon");
  pinicon.setAttribute("title", "Pin/Unpin user");
  pinicon.setAttribute("onclick", `pin_unpin_stream("${streamId}")`);
  userstream_container.appendChild(pinicon);
  remote_stream_container.appendChild(userstream_container);
  video_grid_container.appendChild(remote_stream_container); // Add this div element in the container

  remoteStream.play(streamId + "_container" + "_video"); // Add video inside userstream_container
  document.getElementById("video" + streamId).style.objectFit = "contain";
  resize();
}
const pin_unpin_stream = (streamid) =>{
  let video_grid_container = document.getElementById("video-grid"); // Videos container
  let stream_container=document.getElementById(streamid+"_container");
     
  if(pinned_user==streamid){
    remove_pinned_user(streamid);    
  }
  else{
    // video_grid_container.style.visibility="hidden";
    pinned_user=streamid;
    video_grid_container.style.visibility="hidden";
    stream_container.style.visibility="visible";
    stream_container.style.position="absolute";
    stream_container.style.alignSelf="center";
    resize();
     }
}

const remove_pinned_user=(streamId)=>{
  let video_grid_container = document.getElementById("video-grid"); // Videos container
  let stream_container=document.getElementById(streamId+"_container");
  video_grid_container.style.visibility="visible";
  stream_container.style.position="";
  stream_container.style.visibility="";
  stream_container.style.alignSelf="";
  stream_container.style.height="";
  pinned_user=null;
  resize();    
}