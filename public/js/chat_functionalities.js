var socket = io("/");
socket.on("connect", () => {
  add_user(user__name, user__email, -1);
});

var current_channel_message_id;

function onChatClick() {
  // For changing the size of chat window when clicked
  let l = document.getElementById("left");
  let property = document.getElementById("right").style.display;
  let participants = document.getElementById("participants_window");

  if (property == "none") {
    if (participants.style.display == "none") {
      document.getElementById("right").style.display = "flex";
      l.style.width = "70%";
    } else {
      document.getElementById("participants_window").style.display = "none";
      l.style.width = "70%";
      document.getElementById("right").style.display = "flex";
    }
  } else {
    document.getElementById("right").style.display = "none";
    l.style.width = "100%";
  }
  resize();
}

function setup() {
  // To setup the froala editor
  socket.emit("join-room", ROOMID, user__name, user__email);
  socket.on("user-joined", (username, useremail, id) => {
    add_user(username, useremail, id); // When a user join add user's details in the participants list
  });
  socket.on("user-disconnected", remove_user);
  $("#editor").froalaEditor({
    toolbarButtons: [
      "insertLink",
      "insertImage",
      "insertVideo",
      "insertFile",
      "|",
      "color",
      "specialCharacters",
      "|",
    ],
    toolbarButtonsMD: ["insertImage", "insertFile", "|", "color", "|"],
    toolbarButtonsSM: ["insertFile", "|", "color", "|"],
    toolbarButtonsXS: ["insertFile", "color", "|"],

    theme: "dark",
    heightMin: 80,
    heightMax: 80,
    width: "100%",
    imageDefaultWidth: 50,
    imageResizeWithPercent: true,
    charCounterCount: true,
    toolbarBottom: true,
    tabSpaces: 4,
  });

  socket.on("send_channel_message", generate_message);
  document.getElementById("defaultCanvas0").style.display = "none";

  var froala_box = document.getElementsByClassName("fr-box")[0];
  if (
    froala_box.childNodes.length >= 2 &&
    froala_box.childNodes[1].tagName == "DIV" &&
    froala_box.childNodes[1].style.position == "absolute"
  ) {
    froala_box.childNodes[1].remove();
  }
  var submit_button = document.createElement("a");
    submit_button.innerHTML = `
  <a href="#" id="submit_button" type="button" class="fr-command fr-btn fr-btn-font_awesome pointer"
  style="text-decoration:none;display:flex;float:right;margin-right:1%;align-items:center;"
  title="Send Message" onclick="send_chat_message()">
  <i class="fa fa-send fa-lg" style="color:white;">
  </i>  
  </a>
 `;
  if (document.getElementsByClassName("fr-desktop").length > 0) {
    
    document.getElementsByClassName("fr-toolbar")[0].appendChild(submit_button);
  } else {
    submit_button.style.display ="flex";
    submit_button.style.alignContent="center";
    submit_button.style.marginRight="1%";
    document.getElementById("chat_sender").prepend(submit_button);
  }
}
const generate_message = (
  user_name,
  message,
  timestring,
  channelid,
  is_user_post
) => {
  if (channelName == channelid) {
    // If channelid is same as current channel's id add the message in the chat container
    messages = document.getElementById("chat_messages");
    container = document.getElementsByClassName("right_window_chat")[0];
    message_card = document.createElement("div");
    message_card.style.marginBottom = "0.5%";
    message_card.style.paddingLeft = "0.5%";
    message_card.className = "card";
    message_card.innerHTML = `
    <b>
      <div class="card-title" style="margin-top:0.5%;font-size:1rem;">
        ${user_name}
      </div>
      <div class="card-subtitle" style="font-size:1rem;">
        ${timestring}
      </div>
    </b>
    <div class="card-body" style="margin-top:0.5%;font-size:1rem;">
      ${message}
    </div>
    `;
    if (is_user_post) {
      message_card.style.borderLeft = "4px solid #0354ab";
    }
    messages.append(message_card);
    container.scrollTop = container.scrollHeight;
  }
};
const show_chat = async (cid) => {
  channel = await axios.get(`/api/channel/${cid}`); // Get the channel data

  current_channel_message_id = cid;
  messages = document.getElementById("chat_messages");
  channel.data.messages.map((chat) => {
    // Add all the previous messages in the chat container
    let user_post = false;
    if (chat.email == user__email) {
      user_post = true;
    }
    generate_message(
      chat.username,
      chat.message,
      chat.timestamp,
      current_channel_message_id,
      user_post
    );
  });
};
show_chat(channelName);

const send_chat_message = async () => {
  var message_in_html_form = $("#editor").froalaEditor("html.get");
  $("#editor").froalaEditor("html.set", null);
  messages = document.getElementById("chat_messages");

  var message = message_in_html_form;
  console.log(message);
  await socket.emit(
    "receive_channel_message",
    user__name,
    message,
    user__email,
    channelName
  );
  console.log("YES");
  generate_message(
    user__name,
    message,
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    channelName,
    true
  );
  console.log("Done");
};
function add_user(username, email, id) {
  // Will add the new user in the participant list
  let participant = document.createElement("div");
  participant_name = document.createElement("div");

  participant_name.innerHTML = username;
  participant.setAttribute("id", email);
  participant.style.display = "flex";
  participant.style.color = "white";
  participant.appendChild(participant_name);
  participant.setAttribute("class", "pointer");
  participant.title = "Email: " + email;
  document.getElementById("participants_list").appendChild(participant);

  if (id != socket.id) {
    socket.emit("connect_to_new_user", username, id);
  }
}
function remove_user(useremail) {
  // When the user leaves, then it will remove his/her details from the list
  document
    .getElementById("participants_list")
    .removeChild(document.getElementById(useremail));
}
