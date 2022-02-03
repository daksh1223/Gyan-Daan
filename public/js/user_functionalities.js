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
    end_call(); // For leaving the channel
  });

  $(document).keydown(function (e) {
    // Keyboard shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case "e":
          toggle_user_mic(localStream); // Will mute/unmute the stream
          break;
        case "d":
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
  let screen_share=document.getElementById("screen-share-icon");
  if(screen_share.innerHTML=="stop_screen_share")
  screen_share.innerHTML = "screen_share";
  else screen_share.innerHTML = "stop_screen_share";
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
async function toggle_play_stop_video(cid) {
  toggle_button_background($("#record-btn"));
  let record_icon=document.getElementById("record-icon");
  if(record_icon.innerHTML=="play_circle") {record_icon.innerHTML="pause";}
  else record_icon.innerHTML="play_circle"
  if (record_icon.innerHTML=="pause") {
    let record_stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      useraudio: true
    });
    // console.log(record_stream);
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
    let size = recording.size;
    if (Math.trunc(size / 1024)) {
      size = Math.trunc(size / 1024);
      if (Math.trunc(size / 1024)) {
        size = Math.trunc(size / 1024) + " MB";
      } else size = size + " KB";
    } else size = size + " B";

    

    let formData = new FormData();
    formData.append("upload", recording);
    formData.append("channelID", cid);
    formData.append("isRecording", true);
    let response = await axios.post("/api/uploadFile", formData);
    video_stream = null;
    media_recorder = null;
    blobs_recorded = [];
    let message = `<br><div style="border: 1px solid;border-radius: 5px;width:fit-content;padding:2%;">
    <b>Meet Recording Detail:<hr style="border: 1px solid black;background-color: black;height:1px;">
    Recorded by: ${user__name}<br> 
    </b>
    Download Link: <a href="${response.data.path}" download>Link</a>
    <br>
    Download Size: ${size}
    </div>
    `;
    let timestring = new Date().toLocaleString("en-US", {
			timeZone: "Asia/Kolkata",
		});
		let generatedMessageId = await axios.post("/api/message", {
			user_name: "GyanDaan Bot",
			message,
			email: "",
			timestring,
			channel_id: cid,
			type:"meet"
		});
		//console.log(generatedMessageId);
		generatedMessageId = generatedMessageId.data;
		await socket.emit(
			"receive_channel_message",
			"GyanDaan Bot",
			message,
			"",
			cid,
			generatedMessageId,
			timestring,
			"meet"
		);
    generate_message(
      "GyanDaan Bot",
      message,
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      channelName,
      true
    );
    // console.log(response, recording);
  }
}
function toggle_user_mic(localStream) {
  // console.log(localStream.audioName)
  let micicon=document.getElementById("mic-icon")
    toggle_button_background($("#mic-btn")); // To toggle user's mute/unmute button color
    if (micicon.innerHTML == "mic_off") {
      micicon.innerHTML="mic";
      localStream.unmuteAudio(); // To unmute the stream
      toggleVisibility(localStream, uid + "_mute", false);
    }else {
      micicon.innerHTML="mic_off";
    localStream.muteAudio(); // To mute the stream
    toggleVisibility(localStream, uid + "_mute", true);
    
  }
}

function toggle_user_video(localStream) {
  toggle_button_background($("#video-btn")); // To toggle user's hide/show video button color
  let video_icon=document.getElementById("video-icon");
  if (video_icon.innerHTML=="videocam_off") {
    video_icon.innerHTML="videocam";
    localStream.unmuteVideo(); // To hide the video
  } else {
    video_icon.innerHTML="videocam_off";
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
function controls_provide(cid) {
  let controls_container = document.getElementById("main__controls"),
    val = controls_container.innerHTML;

  if (allow_students_stream != "false" || isEducator != "false") {
    controls_container.innerHTML =
      val +
      ` <button id="mic-btn" type="button" class="btn main__controls__button btn-lg pointer btn-danger" title="User Audio">
            <span id="mic-icon" class="material-icons">mic_off</span>
        </button>
        <button id="video-btn" type="button" class="btn btn-dark main__controls__button btn-lg pointer" title="User Video">
            <span id="video-icon" class="material-icons">videocam</span>
        </button>
        <button id="screen-share-btn" type="button" class="btn  btn-dark main__controls__button btn-lg pointer"
            title="Screen Share">
            <span class="material-icons" id="screen-share-icon"
            >screen_share</span
          >
           </button>
        <button id="record-btn" type="button" class="btn btn-dark main__controls__button  btn-lg pointer"  title="Record meet"
            onclick="toggle_play_stop_video('${cid}')">
            <span class="material-icons" id="record-icon"
            >play_circle</span
            </button>
        <button id="exit-btn" type="button" class="btn btn-danger main__controls__button btn-lg pointer" title="End Call" style="background-color: #ea4335">
            <span onclick="end_call()" class="material-icons">call_end</span>
        </button>`;
  } else
    controls_container.innerHTML =
      val +
      `<button id="exit-btn" type="button" class="btn btn-danger main__controls__button btn-lg pointer" title="End Call" style="background-color: #ea4335">
           <span onclick="end_call()" class="material-icons">call_end</span>
      </button>`;
}

controls_provide(channelName)