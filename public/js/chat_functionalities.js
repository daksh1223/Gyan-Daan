var socket = io("/");
socket.on("connect", () => {
  add_user(user__name, user__email, -1, profile_pic, isEducator);
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
  socket.emit(
    "join-room",
    ROOMID,
    user__name,
    user__email,
    userID,
    profile_pic,
    isEducator,
    channelName
  );
  socket.on(
    "user-joined",
    (username, useremail, id, pic, educator_status, channelId) => {
      console.log(username, useremail, id, pic, educator_status);
      if (channelId == channelName)
        add_user(username, useremail, id, pic, educator_status); // When a user join add user's details in the participants list
    }
  );
  socket.on("user-disconnected", remove_user);
  socket.on("send_channel_message", generate_message);
  document.getElementById("defaultCanvas0").style.display = "none";
}
setup();
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
    message_card.className = "card message_container";
    message_card.innerHTML = `
      <strong style="margin-top:0.5%;">
        ${user_name}
      </strong>
    <div style="margin-top:0.5%;word-wrap: break-word;overflow:hidden">
      ${message}
    </div>
    <small  style="margin-left:auto;">
        ${timestring}
      </small>
    `;
    if (is_user_post) {
      message_card.style.marginLeft = "auto";
      message_card.style.marginRight = "2.5%";
      message_card.style.backgroundColor = "rgb(79, 70, 229)";
      message_card.style.color = "white";
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
  var message_in_html_form = "";
  if (document.getElementById("myFile").files.length) {
    const file = document.getElementById("myFile").files[0];
    let form = new FormData();
    form.append("upload", file);
    const response = await axios.post("/api/uploadFile", form);
    if (response.data)
      message_in_html_form = `<a href="${response.data.path}">${response.data.displayName}</a>`;
    else return;
    clear_editor();
  } else {
    message_in_html_form =
      "<pre>" + document.getElementById("editor").value + "</pre>";
    clear_editor();
  }
  messages = document.getElementById("chat_messages");

  var message = message_in_html_form;

  await socket.emit(
    "receive_channel_message",
    user__name,
    message,
    user__email,
    channelName
  );
  generate_message(
    user__name,
    message,
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    channelName,
    true
  );
};
function add_user(username, email, id, pic, educator_status) {
  // Will add the new user in the participant list
  let participant = document.createElement("div");
  let status = "Educator";
  if (educator_status === "false") status = "Student";
  if (pic == null) {
    pic = `/images/user.jpg`;
  }
  let participant_details = `
    <image src="${pic}" style="height:3rem;width:3rem;border-radius:50%;"/>
    <div class="participant_details"> 
        <div>${username}</div> 
        <div>
         <small> ${status} </small>
        </div> 
      </div> 
    </div>
  `;
  participant.setAttribute("id", email);
  participant.innerHTML = participant_details;
  participant.setAttribute("class", "participant_block pointer");
  participant.title = "Email: " + email;
  document.getElementById("participants_list").appendChild(participant);

  if (id != socket.id) {
    socket.emit("connect_to_new_user", username, id);
  }
}
function remove_user(useremail, channelId) {
  // When the user leaves, then it will remove his/her details from the list
  if (channelId == channelName)
    document
      .getElementById("participants_list")
      .removeChild(document.getElementById(useremail));
}

function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + "px";
}

function handleChatFileUpload() {
  const file = document.getElementById("myFile").files[0];
  document.getElementById("editor").value = file.name;
  document.getElementById("editor").readOnly = true;
  document.getElementById("editor_container").style.backgroundColor = "#898989";
  document.getElementById("editor").style.backgroundColor = "#898989";
  document.getElementById("editor").style.color = "white";
  document.getElementById("editor_clear").style.backgroundColor = "white";
}

function clear_editor() {
  document.getElementById("editor").value = "";
  document.getElementById("myFile").value = "";
  document.getElementById("editor").readOnly = false;
  document.getElementById("editor_container").style.backgroundColor = "#ededed";
  document.getElementById("editor").style.backgroundColor = "white";
  document.getElementById("editor").style.color = "black";
  document.getElementById("editor").style.height = "100%";
}
