let download_link = {};
let video_stream = null,
  media_recorder = null,
  blobs_recorded = [];

function enableUiControls(localStream) {
  $("#mic-btn").click(function () {
    toggle_user_mic(localStream);
  });

  $("#video-btn").click(function () {
    toggle_user_video(localStream);
  });

  $("#screen-share-btn").click(function () {
    toggle_screen_share_button_icon_color(); // It will set the screen share button icon
    $("#screen-share-btn").prop("disabled", true); // Disable the button on click
    if (screen_share_checker) {
      stopScreenShare(); // If screen sharing is active then stop it
    } else {
      initialize_screen_share(agoraAppId, channelName); // Else start screen sharing
    }
  });

  $("#exit-btn").click(function () {
    leaveChannel(); // For leaving the channel
  });

  $(document).keydown(function (e) {
    // Keyboard shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case "m":
          toggle_user_mic(localStream); // Will mute/unmute the stream
          break;
        case "v":
          toggle_user_video(localStream); // Will hide/show the stream
          break;
        default:
      }
    }
  });
}

function toggle_button_background(btn) {
  btn.toggleClass("btn-dark").toggleClass("btn-danger"); // Set the background color of the button as either dark or red
}

function toggle_screen_share_button_icon_color() {
  $("#screen-share-btn").toggleClass("btn-danger");
  $("#screen-share-icon").toggleClass("fa-times-circle");
}

function toggleVisibility(remoteStream, stream_mute_unmute_id, muted) {
  // Will set the mute/unmute in the required user's stream
  if (muted) {
    document
      .getElementById(stream_mute_unmute_id)
      .setAttribute("class", "fas fa-microphone-slash mute");
  } else {
    document
      .getElementById(stream_mute_unmute_id)
      .setAttribute("class", "fas fa-microphone mute");
  }
}
async function toggle_play_stop_video() {
  toggle_button_background($("#record-btn"));
  $("#record-icon")
    .toggleClass("fas fa-play-circle")
    .toggleClass("fas fa-stop-circle");
  if ($("#record-icon").hasClass("fas fa-stop-circle")) {
    let record_stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    console.log(record_stream);
    media_recorder = new MediaRecorder(record_stream, {
      mimeType: "video/webm",
    });
    media_recorder.addEventListener("dataavailable", function (event) {
      blobs_recorded.push(event.data);
    });
    media_recorder.addEventListener("stop", function () {
      // create local object URL from the recorded video blobs
      let video_local = URL.createObjectURL(
        new Blob(blobs_recorded, { type: "video/mp4" })
      );
      download_link.href = video_local;
    });
    media_recorder.start(1000);
  } else {
    media_recorder.stop();
    let recording = new File(
      blobs_recorded,
      Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) + ".mp4",
      { type: "video/mp4" }
    );
    console.log(recording);
    let formData = new FormData();
    formData.append("upload", recording);
    let response = await axios.post("/api/uploadFile", formData);
    video_stream = null;
    media_recorder = null;
    blobs_recorded = [];
    let message = `<br><div style="border: 1px solid;border-radius: 5px;width:fit-content;padding:2%;">
    <b>Meet Recording Detail:<hr style="border: 1px solid black;background-color: black;height:1px;">
    Recorded by: ${user__name}<br> 
    </b>
    <hr style="border: 1px solid black;background-color: black;height:1px;">
    Download Link: <a href="/${response.data.url}" download>Link</a>
    </div>
    `;
    if (!!response.data.uploaded) {
      await socket.emit(
        "receive_channel_message",
        "True-Meet Bot",
        message,
        "",
        channelName
      );
      generate_message(
        "True-Meet Bot",
        message,
        new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        channelName,
        true
      );
    }
    console.log(response, recording);
  }
}
function toggle_user_mic(localStream) {
  if (localStream.audioName != "default") {
    toggle_button_background($("#mic-btn")); // To toggle user's mute/unmute button color
    $("#mic-icon")
      .toggleClass("fa-microphone")
      .toggleClass("fa-microphone-slash"); // To toggle the mic icon

    if ($("#mic-icon").hasClass("fa-microphone")) {
      localStream.unmuteAudio(); // To unmute the stream
      toggleVisibility(localStream, uid + "_mute", false);
    } else {
      localStream.muteAudio(); // To mute the stream
      toggleVisibility(localStream, uid + "_mute", true);
    }
  }
}

function toggle_user_video(localStream) {
  toggle_button_background($("#video-btn")); // To toggle user's hide/show video button color
  $("#video-icon").toggleClass("fa-video").toggleClass("fa-video-slash"); // Toggle the video icon
  if ($("#video-icon").hasClass("fa-video")) {
    localStream.unmuteVideo(); // To hide the video
  } else {
    localStream.muteVideo(); // To show the video
  }
}
function copy_link() {
  // For copying the url of the meet
  navigator.clipboard.writeText(window.location.href);
}
var time = 0;
function time_tracker() {
  // Will keep a track of duration of the user after the user entered this room
  const timevar = document.getElementById("timer");
  setInterval(() => {
    minutes = parseInt(time / 60);
    seconds = time % 60;
    if (seconds <= 9) {
      seconds = "0" + String(seconds);
    } else seconds = String(seconds);
    if (minutes <= 9) {
      minutes = "0" + String(minutes);
    } else minutes = String(minutes);
    timevar.innerText = minutes + ":" + seconds;
    time++;
  }, 1000);
}

function end_call() {
  location = "/room/" + ROOMID; //Will redirect it back to the room
}
function onParticipantsClick() {
  // For changing the size of participants window when clicked
  let l = document.getElementById("left");
  let property = document.getElementById("right").style.display;
  let participants = document.getElementById("participants_window");

  if (participants.style.display == "none") {
    if (property == "none") {
      participants.style.display = "flex";
      l.style.width = "70%";
    } else {
      document.getElementById("right").style.display = "none";
      l.style.width = "70%";
      participants.style.display = "flex";
    }
  } else {
    l.style.width = "100%";
    participants.style.display = "none";
  }
  resize();
}
