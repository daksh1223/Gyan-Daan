var socket = io("/");
socket.on("connect", () => {
  add_user(user__name, user__email, -1, profile_pic, isEducator);
});

var current_channel_message_id;
var channel_data_messages;
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
      // console.log(username, useremail, id, pic, educator_status);
      if (channelId == channelName)
        add_user(username, useremail, id, pic, educator_status); // When a user join add user's details in the participants list
    }
  );
  socket.on("user-disconnected", remove_user);
socket.on(
	"send_channel_message",
	(
		username,
		message,
		timestamp,
		current_channel_message_id,
		id,
		email,
		type
	) => {
		
		generate_message(
			username,
			message,
			timestamp,
			current_channel_message_id,
			id,
			type
		);

	}
	);
	socket.on("deleteChat", deleteChat);
	socket.on("editChat", editchatData);
 
}
const generate_message = (
	user_name,
	message,
	timestring,
	channel_id,
	message_id,
	type,
	is_user_post
) => {
	if (channel_id == channelName) {
		// If the ID of the channel from where this request came from is same as te current channel message ID ten add the emited message.
		messages = document.getElementById("chat_messages");
    container = document.getElementsByClassName("right_window_chat")[0];
		message_card = document.createElement("div");

		message_card.style.marginBottom = "1%";
		message_card.style.width = "fit-content";
		message_card.style.marginLeft = "2.5%";
		message_card.style.maxWidth = "60%";
		message_card.style.padding = "1%";
		message_card.className = "card shadow";
		let topSection,
			nav = getNavHtml(type, user_name, message_id, is_user_post);

		topSection = `  <strong class="chatHeader">
        <div class="chatUserName">${user_name}</div>
       
       ${nav}

      </strong>`;

		message_card.innerHTML = `
    ${topSection}
    <div class="chatContent">
      ${message}
    </div>
    <small class="chatFooter" style="margin-left:auto;">
        ${timestring}
      </small>
    `;
		if (is_user_post) {
			message_card.style.marginLeft = "auto";
			message_card.style.marginRight = "2.5%";
			message_card.style.backgroundColor = "rgb(79, 70, 229)";
			message_card.style.color = "white";
		}
		// if (user_name == "GyanDaan Bot") {
		// 	message_card.getElementsByClassName("topnav")[0].style.display = "none";
		// }
		message_card.setAttribute("id", message_id);
		messages.append(message_card);
		container.scrollTop = container.scrollHeight;
		let navel = document.getElementById(`nav_${message_id}`);
			$(message_card).hover(
				function () {
					if (navel) {
						navel.style.display = "flex";
					}
				},
				function () {
					if (navel) {
						navel.style.display = "none";
					}
				}
			);
	}
};
const show_chat = async (cid) => {
  channel = await axios.get(`/api/channel/${cid}`); // Get the channel data
// console.log(cid,channel)
  current_channel_message_id = cid;
  // messages = document.getElementById("chat_messages");
  //console.log(channel.data.messages);
  channel.data.channel_details.messages.map((chat) => {
    // Add all the previous messages in the chat container
    let user_post = false;
    if (chat.email == user__email) {
      user_post = true;
    }
    // generate_message(
    //   chat.username,
    //   chat.message,
    //   chat.timestamp,
    //   current_channel_message_id,
    //   user_post
    // );
    		generate_message(
					chat.username,
					chat.message,
					chat.timestamp,
					current_channel_message_id,
					chat._id,
					chat.type,
					user_post
				);
  });
};
show_chat(channelName);

const send_chat_message = async (msg) => {

	let message_in_html_form = "";
	let type = "message";
	if (msg) {
		message_in_html_form = msg;
	} else if (document.getElementById("myFile").files.length) {
		const file = document.getElementById("myFile").files[0];
		let form = new FormData();
		form.append("upload", file);
		const response = await axios.post("/api/uploadFile", form);
		if (response.data)
			message_in_html_form = `<div><a href="${response.data.path}"><pre>${response.data.displayName}</pre></a></div>`;
		else return;
		clear_editor();
		type = "file";
	} else {
		message_in_html_form =
			"<pre>" + document.getElementById("editor").value + "</pre>";
		clear_editor();
	}
	let message = message_in_html_form;
	let timestring = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kolkata",
	});

	let generatedMessageId = await axios.post("/api/message", {
		user_name:user__name,
		message,
		email:user__email,
		timestring,
		channel_id: channelName,
		type,
	});
	// console.log(generatedMessageId);
	generatedMessageId = generatedMessageId.data;
	await socket.emit(
		"receive_channel_message",
		user__name,
		message,
		user__email,
		channelName,
		generatedMessageId,
		timestring,
		type
	);



	generate_message(
		user__name,
		message,
		timestring,
		channelName,
		generatedMessageId,
		type,
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
setup();