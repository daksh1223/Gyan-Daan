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
function copy_link() { // For copying the url of the meet
  navigator.clipboard.writeText(window.location.href);
}
var time = 0;
function time_tracker() { // Will keep a track of duration of the user after the user entered this room
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
function onParticipantsClick() { // For changing the size of participants window when clicked
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
