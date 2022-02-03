const url = `/api/room/${ROOM_ID}`;
var socket = io("/"); // For connecting the socket.
let channel_id;
var current_room_data;
var channel_data_copy; // Will contain all te data present in the current channel
var channel_data_messages; // Will contain all the messages present in the current channel.
var current_channel; // ID of the current channel
var general_channel; // ID of the General channel
var current_channel_message_id; // ID of the current channel message
var current_channel_meet_link = null;
var current_meet;
let current_context_channel;
let create_meet_container = document.getElementById("create_meet");
let create_poll_container = document.getElementById("create_poll");
let notifications_container = document.getElementById("channel_notifications");
let notification_toggler = 0;
let channel_last_notification_id = 0;
let user_last_notification_id = 0;
let show_files_container = document.getElementById("show_files");

socket.on("connect", () => {
  // console.log("yes");
});
if (isEducator != "false") {
  create_meet_container.innerHTML = `<i class="fa fa-video"></i> Start/Schedule a meet `;
  create_poll_container.innerHTML = `<i class="fas fa-poll-h"></i> Create Poll `;
  notifications_container.title = `Notifications for students`;
} else {
  notifications_container.title =
    "See all the notifications given by the educator";
}
const room_data = async (url) => {
	promise = await axios.get(url); // Fetch all the data present in this room
	var room = document.getElementById("room_name");
	var room_desc = document.getElementById("room_desc");
	var room_container = document.createElement("div");
	icon = document.createElement("div");
	current_room_data = promise.data.room_detail;
	let icon_value = promise.data.room_detail.name[0].toUpperCase();
	if (promise.data.room_detail.name.length > 1) {
		icon_value += promise.data.room_detail.name[1].toUpperCase();
	}
	// Will set the properties of the room in the frontend

	let temp = ` 
    <a href="/home" class="home_link" style="float:left;margin-left:5%;">
      <i class="fas fa-home mx-1" ></i> Home</a>
    <div style="padding:5%; width:15vw; height:15vw;align-self:center;" >
      <img src="https://place-hold.it/200/${promise.data.room_detail.room_color}/fff&text=${icon_value}&fontsize=80" style="border-radius:50%;height:100%;width:100%;"></img>
    </div>
    <div style="width:100%;display:flex;flex-direction:row;padding:0 10%;" class="shadow-sm">
        <h2 style="color:black;text-align:center; width:80%;word-break:break-word;" id="room_data_name">${promise.data.room_detail.name}</h2>
        <a id="user_data" href="#" role="button" data-toggle="dropdown" aria-expanded="false" style="color:black;margin:auto"><i class="fas fa-bars"></i></a>
        <ul class="dropdown-menu" >`;
	if (isEducator != "false") {
		temp += `  <li>
            <a class="dropdown-item" href="#" onclick="add_user('${promise.data.room_detail._id}')">
              <i class="fas fa-user-plus"></i> Add users
            </a>
          </li>
          <li>
            <a class="dropdown-item" href="#" onclick="remove_user('${promise.data.room_detail._id}')">
              <i class="fas fa-user-minus"></i> Remove users
            </a>
            
          </li>
          <li>
          <a href="#" class="dropdown-item" title="Add Channel" data-toggle="modal"
           data-target="#channel_creation_modal"><i class="fas fa-plus"></i> Add Channel</a>
          </li>
          <li>
            <a class="dropdown-item" href="#" title="Edit Course Details" data-toggle="modal"
           data-target="#RoomcreationModal" onclick="fillRoomEditModal()">
              <i class="fas fa-edit"></i> Edit Course
            </a>
          </li>`;
	}
	temp += `
          <li>
            <a href="#" class="dropdown-item" onclick="leave_room('${promise.data.room_detail._id}','${promise.data.room_detail.channels[0]._id}')">
              <i class="fas fa-sign-out-alt")></i> Leave Course 
            </a>
          </li>
        </ul>
    </div>
    <div id="room_desc" class="shadow-sm">${promise.data.room_detail.description}</div>
  `;
	room_container.innerHTML = temp;
	room_container.style.display = "flex";
	room_container.style.flexDirection = "column";
	room.appendChild(room_container); // Append the container in the room

	var channel_container = document.getElementById("channels_container"); // Container for all the channels inside the room where this user is present

	general_channel = promise.data.room_detail.channels[0]._id; // set the ID of the General channel
	for (var id = 0; id < promise.data.room_detail.channels.length; id++) {
		if (promise.data.user_present[id]) {
			// Add all the channels and their properties inside the channel container.
			var temp_channel_container = document.createElement("div");

			temp_channel_container.setAttribute(
				"id",
				promise.data.room_detail.channels[id]._id + "container"
			);
			temp_channel_container.setAttribute(
				"onclick",
				`channel_data('${promise.data.room_detail.channels[id]._id}')`
			);
			temp_channel_container.setAttribute("class", "container_element");
			temp_channel_container.style.cursor = "pointer";

			temp_channel_setting_container = document.createElement("div");
			if (id) {
				let temp = `
      <a style="float:left;" href="#" id=${promise.data.room_detail.channels[id]._id} onclick="channel_data('${promise.data.room_detail.channels[id]._id}')">
      ${promise.data.room_detail.channels[id].name}
      </a>
       <div class="container_element_settings dropdown">
          <a id="user_data" href="#" role="button" data-toggle="dropdown" aria-expanded="false" style="float:right;margin-right:1%;">
            <i class="fas fa-ellipsis-h"></i>
          </a>
  
          <ul class="dropdown-menu">`;
				if (isEducator != "false") {
					temp += `
            <li>
                <a class="dropdown-item" href="#" onclick="add_user('${promise.data.room_detail.channels[id]._id}')">
                  <i class="fas fa-user-plus"></i> Add users
                </a>
            </li>
            <li>
            <a class="dropdown-item" href="#" onclick="remove_user('${promise.data.room_detail.channels[id]._id}')">
              <i class="fas fa-user-minus"></i> Remove users
            </a>
            
          </li>
      `;
				}

				temp += `
            <li>
                <a class="dropdown-item" href="#" onclick="leave_channel('${promise.data.room_detail.channels[id]._id}')">
                  <i class="fas fa-sign-out-alt"></i> Leave Channel
                </a>
            </li>
          </ul>
      </div>
      `;
				temp_channel_container.innerHTML = temp;
			} else {
				temp_channel_container.innerHTML = `
      <a  style="float:left;" href="#" id=${promise.data.room_detail.channels[id]._id} onclick="channel_data('${promise.data.room_detail.channels[id]._id}')">
      ${promise.data.room_detail.channels[id].name}
      </a>
      <div class="container_element_settings dropdown">
      
      </div>
      `;
			}
			channel_container.appendChild(temp_channel_container);
		}
	}

	var response = await channel_data(promise.data.room_detail.channels[0]._id); // Will fetch all the data of the General Channel
	return promise.data;
};
const channel_data = async (cid) => {
  document.getElementById("files_container").style.display = "none";
  document.getElementsByClassName("chat_container")[0].style.display = "flex";
  channel_id = cid;
  if (current_channel) {
    document.getElementById(
      current_channel + "container"
    ).style.backgroundColor = ""; // Set the previously selected channel color as white
    document.getElementById(current_channel).style.color = "black";
  }
  current_meet = null;
  document.getElementById(cid).style.color = "#4f46e5";
  document.getElementById(cid + "container").style.backgroundColor = "#e5ddd5";
  current_channel_meet_link = null;

  channel = await axios.get(`/api/channel/${cid}`); // Get the current channel's data
  channel = channel.data;
  user_last_notification_id = channel.user_last_notification_id;
  channel = channel.channel_details;
  // console.log(channel);
  channel_last_notification_id = channel.last_notification_id;
  notification_alert();
  current_channel = cid; // Set the current channel as cid
  current_channel_message_id = cid;
  channel_data_copy = channel;
  current_context_channel = channel_data_copy;
  document.getElementById("channel_name_display").innerHTML = channel.name;
  channel_data_messages = channel.messages;
  messages = document.getElementById("chat_messages");
  meets_container = document.getElementById("meets_container");
  user_container = document.getElementById("users_container");
  notifications_handler();


  while (meets_container.firstChild) {
    meets_container.removeChild(meets_container.firstChild); // Remove all the meets present in the channel meet container
  }
  while (user_container.firstChild) {
			user_container.removeChild(user_container.firstChild); // Remove all the users present in the channel users container
		}
  addUsersToContainer(channel.users, user_container);
  for (var i = 0; i < channel.meets.length; i++) {
    // Add current channel's meet
    temp_meet = document.createElement("div");
    let date = channel.meets[i].start_date.split('-');
    let datetime = date[0] + date[1] + date[2]
    let time = channel.meets[i].start_time.split(':');
    datetime += "T" + time[0] + time[1] + "00Z"
    // let datetime =''
    let google_link_calendar = `https://www.google.com/calendar/render?action=TEMPLATE&text=${channel.meets[i].name}&dates=${datetime}%2F`;
    temp_meet.innerHTML = `
    <a  style="float:left;width:80%" href="#" onclick="meet_message('${channel.meets[i]._id}')" >
      ${channel.meets[i].name}
    </a>
    <div class="container_element_settings dropdown">
          <a id="user_data" href="#" role="button" data-toggle="dropdown" aria-expanded="false" style="float:right;margin-right:1%;">
            <i class="fas fa-ellipsis-h"></i>
          </a>
  
          <ul class="dropdown-menu">
            <li>
                <a class="dropdown-item" href="${google_link_calendar}">
                  Add to Google Calendar
                </a>
            </li>
          </ul>
      </div>
    `;
    // temp_meet.setAttribute("class", "container_element");
    temp_meet.setAttribute("id", `${channel.meets[i]._id}meet`);
    temp_meet.setAttribute("class", "container_element");
    temp_meet.setAttribute(
      "onclick",
      `meet_message( '${channel.meets[i]._id}')`
    );
    temp_meet.style.cursor = "pointer";
    meets_container.appendChild(temp_meet);
  }
  show_chat(""); // Show the chat of current channel
  for (let i = 0; i < channel_data_copy.polls.length; i++) {
    let poll = await axios.get(`/api/get_poll/${channel_data_copy.polls[i]}`);
    poll = poll.data;
    let total_votes = 0;
    for (let j = 0; j < poll.options.length; j++) {
      document.getElementById(
        `label_${poll.options[j]._id}`
      ).innerHTML = `<div style="display:flex;flex-direction:column;width:100%">
      <div style="display:flex;flex-direction:row; width:100%">
      <div>${poll.options[j].name}</div> <div style="margin-left:auto">${poll.options[j].likeCount}</div></div></div>`;
			if (poll.options[j].likes.includes(userID)) {
				document.getElementById(`option_${poll.options[j]._id}`).checked = true;
			}
			total_votes += poll.options[j].likeCount;
		}
		for (let j = 0; j < poll.options.length; j++) {
			let width = total_votes
				? Math.floor((poll.options[j].likeCount * 100) / total_votes)
				: 0;
			document
				.getElementById(`progressbar_${poll.options[j]._id}`)
				.setAttribute("aria-valuenow", width);
			document.getElementById(
				`progressbar_${poll.options[j]._id}`
			).style.width = `${width}%`;
		}
	}
};

const show_chat = (prefix) => {
	while (messages.firstChild) {
		messages.removeChild(messages.firstChild); // Remove previous channel's chats
	}

	if (current_channel_meet_link) {
		// If the current channel is a meet channel then show join meet else show create meet option.
    document.getElementById("show_files").innerHTML = '<i class="fas fa-folder mx-1"></i>Recordings'
		document.getElementById("create_meet").style.display = "none";
		document.getElementById("join_meet").style.display = "";
  } else {
    document.getElementById("show_files").innerHTML = '<i class="fas fa-folder mx-1"></i>Files'
		document.getElementById("create_meet").style.display = "";
		document.getElementById("join_meet").style.display = "none";
	}
	prefix = prefix.toLowerCase();
	// console.log(channel_data_messages);
	channel_data_messages.map((chat) => {
		let name = chat.username.toLowerCase(),
			message = chat.message.toLowerCase(),
			timestamp = chat.timestamp.toLowerCase();
		// Add those chats which contains the string typed in the search bar.
		if (
			name.includes(prefix) ||
			message.includes(prefix) ||
			timestamp.includes(prefix)
		) {
			let user_post = false;
			if (email == chat.email) {
				user_post = true;
			}
			generate_message(
				chat.username,
				chat.message,
				chat.timestamp,
				current_channel_message_id,
				chat._id,
				chat.type,
				user_post,
				
			);
		}
	});
};
const room = room_data(url);

function setup() {
	// For setting up the froala editor (Rich Text editor)
	socket.emit("join-room", ROOM_ID, null, null, userID);
}
setup()

const generate_message = (
  user_name,
  message,
  timestring,
  channel_id,
  message_id,
  type,
  is_user_post
) => {
  if (channel_id == current_channel_message_id) {
    // If the ID of the channel from where this request came from is same as te current channel message ID ten add the emited message.
    messages = document.getElementById("chat_messages");

    message_card = document.createElement("div");

    message_card.style.marginBottom = "1%";
    message_card.style.width = "fit-content";
    message_card.style.marginLeft = "2.5%";
    message_card.style.maxWidth = "60%";
    message_card.style.padding = "1%";
    message_card.className = "card shadow";
    let topSection, nav = getNavHtml(type, user_name, message_id, is_user_post);

		
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
    messages.scrollTop = messages.scrollHeight;
   
  let navel=document.getElementById(`nav_${message_id}`)
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
		
	
  };
}
const send_chat_message = async (msg, type="message") => {
	let message_in_html_form = "";
	if (msg) {
		message_in_html_form = msg;
	} else if (document.getElementById("myFile").files.length) {
		const file = document.getElementById("myFile").files[0];
		let form = new FormData();
    form.append("upload", file);
    form.append("isRecording", false);
    form.append("channelID", current_channel);
    const response = await axios.post("/api/uploadFile", form);
    current_context_channel.files.push(response.data._id);
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
		user_name,
		message,
		email,
		timestring,
		channel_id: current_channel_message_id,
		type,
	});
	//console.log(generatedMessageId);
	generatedMessageId = generatedMessageId.data;
	await socket.emit(
		"receive_channel_message",
		user_name,
		message,
		email,
		current_channel_message_id,
		generatedMessageId,
		timestring,
		type
	);

	// After emiting the message to the server add this message in the chat container.

	generate_message(
		user_name,
		message,
		timestring,
		current_channel_message_id,
		generatedMessageId,
		type,
		true
	);
	let temp_data = {
		email: email,
		message: message,
		username: user_name,
		timestamp: timestring,
		_id: generatedMessageId,
		type,
	};
	//Add this message in channel_data_messages to access it while searching in the search bar
	channel_data_messages.push(temp_data);
};
function start_meet() {
	location = current_channel_meet_link; // Will change the current url to the meet's url
}
async function meet_message(cid) {
  document.getElementById("files_container").style.display = "none";
  document.getElementsByClassName("chat_container")[0].style.display = "flex";
  current_channel_message_id = cid;
  channel = await axios.get(`/api/channel/${cid}`); //Get the meet channel's data
  channel = channel.data.channel_details;
  current_context_channel = channel;
  channel_data_messages = channel.messages;
  document.getElementById("channel_name_display").innerHTML = channel.name;
  if (current_meet) {
    document.getElementById(`${current_meet}meet`).style.backgroundColor = "";
    document.getElementById(`${current_meet}meet`).children[0].style.color = "";
  }
  document.getElementById(`${cid}meet`).style.backgroundColor = "#e5ddd5";
  document.getElementById(`${cid}meet`).children[0].style.color = "#4f46e5";

  current_meet = cid;

  // Set the properties of the join meet button
  document.getElementById("join_meet").innerHTML =
    '<i class="fas fa-sign-in-alt mx-1"></i>Join Meet';
  document.getElementById("join_meet").setAttribute("onclick", "start_meet()");

  current_channel_meet_link = channel.meet_link;
  // After joining the meet channel display it's content in the frontend
  show_chat("");
  for (let i = 0; i < current_context_channel.polls.length; i++) {
    let poll = await axios.get(
      `/api/get_poll/${current_context_channel.polls[i]}`
    );
    poll = poll.data;
    let total_votes = 0;
    for (let j = 0; j < poll.options.length; j++) {
      document.getElementById(
        `label_${poll.options[j]._id}`
      ).innerHTML = `<div style="display:flex;flex-direction:column;width:100%">
      <div style="display:flex;flex-direction:row; width:100%">
      <div>${poll.options[j].name}</div> <div style="margin-left:auto">${poll.options[j].likeCount}</div></div></div>`;
      if (poll.options[j].likes.includes(userID)) {
        document.getElementById(`option_${poll.options[j]._id}`).checked = true;
      }
      total_votes += poll.options[j].likeCount;
    }
    for (let j = 0; j < poll.options.length; j++) {
      let width = total_votes
        ? Math.floor((poll.options[j].likeCount * 100) / total_votes)
        : 0;
      document
        .getElementById(`progressbar_${poll.options[j]._id}`)
        .setAttribute("aria-valuenow", width);
      document.getElementById(
        `progressbar_${poll.options[j]._id}`
      ).style.width = `${width}%`;
    }
  }
}
function channel_modal_submission() {
  //For creatin a new channel
  const name = document.getElementById("channel_name").value;
  let users = document.getElementById("user_tags").value;
  users = users.split(" ");
  if (name.length) {
    userinfo = {
      name: name,
      users: users,
      is_meet: false,
    };
    axios
      .post("/api/room/" + ROOM_ID + "/add_channel", {
        data: { userinfo: userinfo },
      })
      .then((response) => {
        response = response.data;
        var channel_container = document.getElementById("channels_container");
        var temp_channel_container = document.createElement("div");
        temp_channel_container.setAttribute(
          "onclick",
          `channel_data('${response._id}')`
        );
        temp_channel_container.setAttribute("class", "container_element");
        temp_channel_container.setAttribute(
          "style",
          "cursor: pointer; background-color: rgb(237, 237, 237);"
        );
        let temp = `
          <a href="#" id=${response._id} style="float:left;" onclick="channel_data('${response._id}')" >
            ${response.name}
          </a>
          <div class="container_element_settings dropdown">
            <a style="float:right;margin:1%;" id="user_data" href="#" role="button" data-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-ellipsis-h"></i>
            </a>
            <ul class="dropdown-menu">
            `;
				if (isEducator != "false") {
					temp += `
              <li>
                <a class="dropdown-item" href="#" onclick="add_user('${response._id}')">
                  <i class="fas fa-user-plus"></i> Add users
                </a>
              </li>
              <li>
            <a class="dropdown-item" href="#" onclick="remove_user('${response._id}')">
              <i class="fas fa-user-minus"></i> Remove users
            </a>
            
          </li>`;
				}

				temp += `
              <li>
               <a class="dropdown-item" href="#" onclick="leave_channel('${response._id}')">
                  <i class="fas fa-sign-out-alt"></i> Leave Channel
               </a> 
              </li>
            </ul>
          </div>
        `;
				temp_channel_container.innerHTML = temp;
				temp_channel_container.setAttribute("id", response._id + "container");
				channel_container.appendChild(temp_channel_container);
		
      });
    document.getElementById("modal_close_channel").click();
	}
  		
}
async function meet_modal_submission() {
	// For creating a new meet
	const name = document.getElementById("meet_name").value;
	const time = document.getElementById("meet_time").value;
	const date = document.getElementById("meet_date").value;
	const allow_students_stream = document.getElementById(
		"Allow_Students_Stream"
	).checked;
	// console.log(name, date, time, allow_students_stream);
	if (name.length && time.length && date.length) {
		userinfo = {
			name: name,
			channel_id: current_channel,
			is_meet: true,
			allow_students_stream,
		};
	

		response = await axios.post("/api/room/" + ROOM_ID + "/add_channel", {
			data: { userinfo: userinfo, date, time },
		});
		response = response.data;

		meet = `<br><div class="meet">
        <b>Meet Detail:<hr style="border: 1px solid black;background-color: black;height:1px;">
        Meet scheduled by: ${user_name}<br> 
        Meet name: ${name}<br>
        Meet start date: ${date}<br>
        Meet start time: ${time}<br>
        </b>
        <hr style="border: 1px solid black;height:1px;">
        To get more info about this 
        <button class="btn btn-dark">
        <a href='#' onclick=meet_message('${response._id}') class="custom_link_black" type="button"  style="color:white;"
        >click here</a></button>
        </div>
        `;
		// Will send a new message to other users by the name of GyanDaan Bot
		let timestring = new Date().toLocaleString("en-US", {
			timeZone: "Asia/Kolkata",
		});
		let generatedMessageId = await axios.post("/api/message", {
			user_name: "GyanDaan Bot",
			message: meet,
			email: "",
			timestring,
			channel_id: current_channel_message_id,
			type:"meet"
		});
		//console.log(generatedMessageId);
		generatedMessageId = generatedMessageId.data;
		await socket.emit(
			"receive_channel_message",
			"GyanDaan Bot",
			meet,
			"",
			current_channel_message_id,
			generatedMessageId,
			timestring,
			"meet"
		);

		generate_message(
			"GyanDaan Bot",
			meet,
			timestring,
			current_channel_message_id,
			generatedMessageId,
			"meet",
			false
		);

    meets_container = document.getElementById("meets_container");
    temp_meet = document.createElement("div");
    temp_meet.setAttribute("class", "container_element");
    temp_meet.setAttribute("id", `${response._id}meet`);

    let parsedDate = date.split('-');
    let datetime = parsedDate[0] + parsedDate[1] + parsedDate[2]
    let parsedTime = time.split(':');
    datetime+= "T" + parsedTime[0] + parsedTime[1] + "00Z"
    let google_link_calendar = `https://www.google.com/calendar/render?action=TEMPLATE&text=${name}&dates=${datetime}%2F`;
    temp_meet.innerHTML = `
    <a  style="float:left;width:80%" href="#" onclick="meet_message('${response._id}')" >
      ${name}
    </a>
    <div class="container_element_settings dropdown">
          <a id="user_data" href="#" role="button" data-toggle="dropdown" aria-expanded="false" style="float:right;margin-right:1%;">
            <i class="fas fa-ellipsis-h"></i>
          </a>
  
          <ul class="dropdown-menu">
            <li>
                <a class="dropdown-item" href="${google_link_calendar}">
                  Add to Google Calendar
                </a>
            </li>
          </ul>
      </div>
    `;
    meets_container.appendChild(temp_meet);
    document.getElementById("meet_modal_close").click();
  }
}

async function leave_channel(channel_id) {
	// For leaving a channel
	var response = await axios.delete("/api/room/" + ROOM_ID, {
		data: { channel_id: channel_id },
	});
	var channel_container = document.getElementById("channels_container");
	channel_container.removeChild(
		document.getElementById(channel_id + "container")
	);
	current_channel = general_channel;
	document.getElementById(general_channel).click();
}
async function leave_room(room_id, channel_id) {
  var response = await axios.delete("/api/room/" + ROOM_ID, {
    data: { channel_id: channel_id },
  });

  response = await axios.delete("/api/room/", {
    data: { room_id: ROOM_ID },
  });
  location = "/home";
}

function add_user(cid) {
	if (ROOM_ID == cid) {
		// For adding a new user
		document.getElementById("add_users_muted_text").innerHTML =
			"Add users that are currently present in the organization by typing their email id.";
	} else {
		document.getElementById("add_users_muted_text").innerHTML =
			"Add users that are currently present in the room by typing their email id.";
	}
	document.getElementsByClassName("add_users_link")[0].setAttribute("id", cid);
	document.getElementsByClassName("add_users_link")[0].click();
}
function remove_user(cid) {
	document
		.getElementsByClassName("remove_users_link")[0]
		.setAttribute("id", cid);
	document.getElementsByClassName("remove_users_link")[0].click();
}
async function add_users_modal_submission() {
  // Modal for adding user in the room or channel
  var users = document.getElementById("add_user_tags").value;
  users = users.split(" ");
  let user_container = document.getElementById("users_container");
  if (ROOM_ID == document.getElementsByClassName("add_users_link")[0].id) {
    var response = await axios.post("/api/add_users", {
      room_id: ROOM_ID,
      users: users,
    });
    //console.log(response.data,users);
 
    if (general_channel == current_channel) {
    

     addUsersToContainer(response.data, user_container);
      
    }
  } else {
    var response = await axios.post("/api/add_users", {
      channel_id: document.getElementsByClassName("add_users_link")[0].id,
      channel_room: ROOM_ID,
      users: users,
    });
    
    if (
      document.getElementsByClassName("add_users_link")[0].id == current_channel
    ) {
      
      addUsersToContainer(response.data, user_container);
    }
  }
  document.getElementById("add_users_modal_close").click();
}
async function user_deletion_modal_submission() {
  // Modal for adding user in the room or channel
  var users = document.getElementById("user_deletion_tags").value;
  users = users.split(" ");
  if (ROOM_ID == document.getElementsByClassName("remove_users_link")[0].id) {
    var response = await axios.post("/api/remove_users", {
      room_id: ROOM_ID,
      users: users,
    });
    user_container = document.getElementById("users_container");

    for (var i = 0; i < response.data.length; i++) {
      temp_user = document.getElementById(response.data[i].email);
      if (temp_user) user_container.removeChild(temp_user);
    }
  } else {
    var response = await axios.post("/api/remove_users", {
      channel_id: document.getElementsByClassName("remove_users_link")[0].id,
      channel_room: ROOM_ID,
      users: users,
    });
    if (
      document.getElementsByClassName("remove_users_link")[0].id ==
      current_channel
    ) {
      user_container = document.getElementById("users_container");

      for (var i = 0; i < response.data.length; i++) {
        temp_user = document.getElementById(response.data[i].email);
        user_container.removeChild(temp_user);
      }
    }
  }
  document.getElementById("user_deletion_modal_close").click();
}
function auto_grow(element) {
	element.style.height = "5px";
	element.style.height = element.scrollHeight + "px";
}

function handleChatFileUpload() {
	const file = document.getElementById("myFile").files[0];
	document.getElementById("editor").value = file.name;
	document.getElementById("editor").readOnly = true;
	document.getElementById("editor").style.backgroundColor = "#898989";
	document.getElementById("editor").style.color = "white";
	document.getElementById("editor_clear").style.backgroundColor = "white";
}
socket.on(
	"send_channel_message",
  (username, message, timestamp, current_channel_message_id, id, email, type) => {
    
		generate_message(
			username,
			message,
			timestamp,
			current_channel_message_id,
			id,
			type
		);
		let temp_data = {
			email: email,
			message: message,
			username: username,
			timestamp: timestamp,
			_id: id,
			type
		};
		//Add this message in channel_data_messages to access it while searching in the search bar
		channel_data_messages.push(temp_data);
	}
);
socket.on("deleteChat", deleteChat);
socket.on("editChat", editchatData);

function clear_editor() {
	document.getElementById("editor").value = "";
	document.getElementById("myFile").value = "";
	document.getElementById("editor").readOnly = false;
	document.getElementById("editor").style.backgroundColor = "white";
	document.getElementById("editor").style.color = "black";
	document.getElementById("editor").style.height = "100%";
}

async function poll_modal_submission() {
  const poll_name = document.getElementById("poll_name").value;
  const options = document.getElementById("poll_tags").value.split(",");
  const type = document.getElementById("SCP").checked ? "SCP" : "MCP";
  const response = await axios.post("/api/create_poll", {
    name: poll_name,
    options,
    type,
    channel_id: current_context_channel._id,
  });
  const input_type = type === "SCP" ? "radio" : "checkbox";
  let msg = `<h6>${poll_name}</h6>`;
  for (let i = 0; i < options.length; i++) {
    msg += `
    <div class="form-check poll_option" >
      <input class="form-check-input"  type=${input_type} value="" id="option_${response.data.options[i]._id}" name="poll_${response.data._id}" onchange="toggle_option('${response.data._id}')">
      <label class="form-check-label" for="option_${response.data.options[i]._id}" id="label_${response.data.options[i]._id}">
      <div style="display:flex;flex-direction:column;width:100%;">
      <div style="display:flex;flex-direction:row;width:100%">
      <div>${options[i]}</div> <div style="margin-left:auto">${response.data.options[i].likeCount}</div></div></div>
      </label>
      <div class="progress" style="height:5px">
  <div class="progress-bar progress-bar-striped" id="progressbar_${response.data.options[i]._id}" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
</div>
    </div>
    `;
	}
	send_chat_message(msg,"poll");
	document.getElementById("modal_close").click();
}

function update_poll(poll) {
  // console.log("here");
  let total_votes = 0;
  for (let i = 0; i < poll.options.length; i++) {
    document.getElementById(
      `label_${poll.options[i]._id}`
    ).innerHTML = `<div style="display:flex;flex-direction:column;width:100%">
      <div style="display:flex;flex-direction:row; width:100%">
      <div>${poll.options[i].name}</div> <div style="margin-left:auto">${poll.options[i].likeCount}</div></div></div>`;
    total_votes += poll.options[i].likeCount;
  }
  for (let j = 0; j < poll.options.length; j++) {
    let width = total_votes
      ? Math.floor((poll.options[j].likeCount * 100) / total_votes)
      : 0;
    document
      .getElementById(`progressbar_${poll.options[j]._id}`)
      .setAttribute("aria-valuenow", width);
    document.getElementById(
      `progressbar_${poll.options[j]._id}`
    ).style.width = `${width}%`;
  }
}
socket.on("update_poll", update_poll);
async function toggle_option(id) {
  const options = document.getElementsByName("poll_" + id);
  let is_checked = [];
  for (let i = 0; i < options.length; i++) {
    is_checked.push(options[i].checked);
  }
  let poll = await axios.post("/api/update_vote", {
    id,
    options: is_checked,
  });
  poll = poll.data;
  let total_votes = 0;
  for (let i = 0; i < poll.options.length; i++) {
    document.getElementById(
      `label_${poll.options[i]._id}`
    ).innerHTML = `<div style="display:flex;flex-direction:column;width:100%">
      <div style="display:flex;flex-direction:row; width:100%">
      <div>${poll.options[i].name}</div> <div style="margin-left:auto">${poll.options[i].likeCount}</div></div></div>`;
    total_votes += poll.options[i].likeCount;
  }
  for (let j = 0; j < poll.options.length; j++) {
    let width = total_votes
      ? Math.floor((poll.options[j].likeCount * 100) / total_votes)
      : 0;
    document
      .getElementById(`progressbar_${poll.options[j]._id}`)
      .setAttribute("aria-valuenow", width);
    document.getElementById(
      `progressbar_${poll.options[j]._id}`
    ).style.width = `${width}%`;
  }
  await socket.emit("toggle_option", poll);
}

function fillRoomEditModal() {
	document.getElementById("edit_room_name").value = current_room_data.name;
	document.getElementById("edit_room_description").value =
		current_room_data.description;
	current_room_data.tags.forEach((tag) => {
		$("#edit_room_tags").tagsinput("add", tag);
	});
}

async function room_edit_modal_submission() {
	let name = document.getElementById("edit_room_name").value;
	let description = document.getElementById("edit_room_description").value;
	let room_tags = [];
	if (document.getElementById("edit_room_tags").value) {
		room_tags = document.getElementById("edit_room_tags").value.split(",");
	}
	if (name.length) {
		roominfo = {
			id: current_room_data._id,
			name,
			tags: room_tags,
			description,
		};

		axios
			.put("/home/add_room", {
				data: { roominfo },
			})
			.then((response) => {
				response = response.data;
				if (response != "Permission Denied!") {
					document.getElementById("room_desc").innerHTML = response.description;
					document.getElementById("room_data_name").innerHTML = response.name;
					current_room_data = response;
				}
			});
		document.getElementById("room_edit_modal_close").click();
	}
}

function toggleChannelIcon(event, id) {
	let open = event.getAttribute("aria-expanded");
	document
		.getElementById(id)
		.setAttribute(
			"class",
			open === "true"
				? "fas fa-caret-square-right mx-2"
				: "fas fa-caret-square-down mx-2"
		);
}
let zero_adder = (val) => {
  if (val <= 9) {
    return "0" + val;
  } else {
    return val;
  }
};
let date_parser = (date) => {
  date = new Date(date);
  return (
    zero_adder(date.getDate()) +
    "/" +
    zero_adder(date.getMonth() + 1) +
    "/" +
    date.getFullYear() +
    "   " +
    zero_adder(date.getHours()) +
    " : " +
    zero_adder(date.getMinutes()) +
    " : " +
    zero_adder(date.getSeconds())
  );
};

const new_notification_former = (id, title, content, timestamp) => {
  let notifications_container = document.getElementById(
      "notifications_modal_container"
    ),
    temp = "";
  let temp_date = date_parser(timestamp);
  temp += `
      <div class="notification" style="padding:2%" id=${id}>
          <div style="color: rgb(79, 70, 229);display:flex;"><b><div id=${id}_title>${title}</div></b>`;
  if (isEducator != "false") {
    temp += `
      <div class="dropdown" style="margin-left:3px;align-self:center;">
          <a class="dropdown-toggle notification_dropdown notification_elem"  type="button" id="dropdownMenuButton_${id}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          </a>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton_${id}" style="width:max-content;">
            <a class="dropdown-item notification_elem" href="#" onclick="notification_handler('${id}',0)"><i class="fas fa-pen"></i> Edit</a>
            <a class="dropdown-item notification_elem" href="#" onclick="notification_handler('${id}',1)"><i class="fas fa-trash"></i> Delete</a>
          </div>
      </div>
      `;
  }

  temp += `
          </div>
          <small>${temp_date}</small>
          <div id=${id}_content > ${content} </div>
        </div>
      `;

  notifications_container.innerHTML = temp + notifications_container.innerHTML;
};
const add_edit_delete_notifications = (
  type,
  id,
  title,
  content,
  timestamp,
  current_channel_id
) => {
  // console.log(current_channel_id, current_channel);
  if (current_channel_id == current_channel) {
    if (type == 2) {
      channel_data_copy.notifications = channel_data_copy.notifications.filter(
        (notification) => {
          return notification._id != id;
        }
      );
      if (document.getElementById(`${id}`))
        document.getElementById(`${id}`).remove();
    } else {
      if (type == 1) {
        let notification = channel_data_copy.notifications.find(
          (e) => e._id == id
        );
        notification.title = title;
        notification.content = content;
        if (document.getElementById(`${id}`)) {
          document.getElementById(`${id}_title`).innerHTML = title;
          document.getElementById(`${id}_content`).innerHTML = content;
        }
      } else {
        channel_data_copy.notifications.push({
          _id: id,
          title,
          content,
          timestamp,
        });
        new_notification_former(id, title, content, timestamp);
      }
    }
    new_update_adder();
  }
};

const notifications_handler = () => {
  let notifications_container = document.getElementById(
    "notifications_modal_container"
  );

  if (isEducator != "false") {
    document.getElementById("add_notification").style.display = "";
  }
  let notifications = channel_data_copy.notifications;
  notifications_container.innerHTML = "";
  let temp = "";
  for (let i = 0; i < notifications.length; i++) {
    new_notification_former(
      notifications[i]._id,
      notifications[i].title,
      notifications[i].content,
      notifications[i].timestamp
    );
  }
};
let edit_notification_id;
const notification_submit_handler = async () => {
  let type =
    document.getElementById("add_notifications_close").innerHTML == "Add";
  if (isEducator != "false") {
    let data = {};
    let content = document.getElementById("notification_inputfield"),
      title = document.getElementById("notification_titlefield");
    data.content = content.value;
    data.title = title.value;
    if (type) {
      let return_data = await axios.post(
        `/api/channel/${current_channel}/notifications`,
        { data }
      );
      return_data = return_data.data;
      add_edit_delete_notifications(
        0,
        return_data._id,
        return_data.title,
        return_data.content,
        return_data.timestamp,
        current_channel
      );
      socket.emit(
        "notification_message",
        0,
        return_data._id,
        return_data.title,
        return_data.content,
        return_data.timestamp,
        current_channel
      );
    } else {
      axios.put(
        `/api/channel/${current_channel}/notification/${edit_notification_id}`,
        { data }
      );
      add_edit_delete_notifications(
        1,
        edit_notification_id,
        title.value,
        content.value,
        0,
        current_channel
      );
      socket.emit(
        "notification_message",
        1,
        edit_notification_id,
        title.value,
        content.value,
        0,
        current_channel
      );
    }
    new_update_adder(0);
    content.value = "";
    title.value = "";
  }
};

const toggle_add_edit_notification_container = (
  type,
  title = "",
  content = ""
) => {
  if (type == 0) notification_toggler = 1 - notification_toggler;
  else if (type == 1) notification_toggler = 1;
  else notification_toggler = 0;

  if (notification_toggler) {
    document.getElementById(
      "add_notification"
    ).innerHTML = `<i class="fas fa-eye-slash"></i> Hide option`;

    document.getElementById("notification_title").style.display = "";
    document.getElementById("notification_input").style.display = "";
    document.getElementById("notification_titlefield").value = title;
    document.getElementById("notification_inputfield").value = content;
    document.getElementById("add_button_container").style.display = "flex";
    if (type == 1) {
      document.getElementById("add_notifications_close").innerHTML = "Edit";
    } else document.getElementById("add_notifications_close").innerHTML = "Add";
  } else {
    document.getElementById(
      "add_notification"
    ).innerHTML = `<i class="fas fa-plus"></i> New notification`;
    document.getElementById("notification_title").style.display = "none";
    document.getElementById("notification_input").style.display = "none";
    document.getElementById("add_button_container").style.display = "none";
    document.getElementById("notification_inputfield").value = "";
    document.getElementById("notification_titlefield").value = "";
  }
};

const notification_handler = (id, type) => {
  if (type) {
    axios.delete(`/api/channel/${current_channel}/notification/${id}`);
    add_edit_delete_notifications(2, id, 0, 0, 0, current_channel);
    new_update_adder(0);
    socket.emit("notification_message", 2, id, 0, 0, 0, current_channel);
  } else {
    let notification = channel_data_copy.notifications.find((e) => e._id == id);
    edit_notification_id = id;
    toggle_add_edit_notification_container(
      1,
      notification.title,
      notification.content
    );
  }
};
socket.on(
  "receive_notification_message",
  (type, id, title, content, timestamp, channel_id) => {
    add_edit_delete_notifications(
      type,
      id,
      title,
      content,
      timestamp,
      channel_id
    );
  }
);
$("#notifications_modal").on("hidden.bs.modal", function (e) {
  toggle_add_edit_notification_container(2);
});

const new_update_adder = (type = 1) => {
  if (type == 1) {
    channel_last_notification_id++;
  } else {
    if (type == 0) user_last_notification_id = channel_last_notification_id;
  }
  notification_alert();
  if (isEducator != "false" || type == 0)
    axios.post(`/api/channel/${current_channel}/update_notification_id`, {
      type,
      last_notification_id: channel_last_notification_id,
    });
};
const notification_alert = () => {
  // console.log(user_last_notification_id, channel_last_notification_id);
  if (user_last_notification_id != channel_last_notification_id) {
    document.getElementById("channel_notifications").style.color = "red";
    document.getElementById("alert_notification").style.display = "";
  } else {
    document.getElementById("channel_notifications").style.color = "";
    document.getElementById("alert_notification").style.display = "none";
  }
};

async function showChannelFiles() {
  document.getElementById("files_container").style.display = "flex";
  document.getElementsByClassName("chat_container")[0].style.display = "none";
  let onclick_function;
  if (current_context_channel.is_meet) {
    onclick_function = `meet_message('${current_context_channel._id}')`;
  } else {
    onclick_function = `channel_data('${current_context_channel._id}')`;
  }
  document.getElementById(
    "files_container"
  ).innerHTML = `<a id="files_back" class="custom_link" 
  href="#" style="margin:2%;width: fit-content;" onclick=${onclick_function}> 
  <i class="fas fa-chevron-left mx-1"></i>Back
            </a>
            <table class="table mx-auto" style="width: 90%;"">
                <thead>
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Uploaded By</th>
                        <th scope="col">Upload Date</th>
                    </tr>
                </thead>
                <tbody id="all_files">

                </tbody>
            </table>`;
  let files = current_context_channel.is_meet
    ? current_context_channel.recordings
    : current_context_channel.files;
  //console.log(files);
  try {
    const response = await axios.get("/api/get_files/", {
      params: {
        files,
      },
    });
    files = response.data;
  } catch (err) {
    console.log(err);
    document.getElementById("all_files").innerHTML =
      "We have encountered an error while fetching you files. Sorry for Inconvnience!";

    return;
  }
  let file_view = "";
  files.forEach((file) => {
    let time = new Date(file.createdAt);
    file_view += `<tr class="file_row" ><td><a href="${file.path}">${
      file.displayName
    }</a></td>
    <td><a href="/profile/${file.createdBy.email}">${
      file.createdBy.name
    }</a></td>
    <td>${time.getDate()}-${time.toLocaleString("default", {
      month: "short",
    })}-${time.getFullYear()}</td>
    </tr>
    `;
  });
  document.getElementById("all_files").innerHTML = file_view;
}
const addUsersToContainer = (users, user_container) => {

  for (let i = 0; i < users.length; i++) {
   
		// Add current channel's users
		temp_user = document.createElement("div");
		temp_user.setAttribute("id", users[i].email);
		temp_user.setAttribute("title", "Email Id: " + users[i].email);
		temp_user.setAttribute("class", "container_element users pointer");
		let status = "Educator";
		if (users[i].isEducator === false) status = "Student";

		temp_user.innerHTML = `
    <div style="display:flex">
      <image src="${users[i].profilepicUrl}" class="pic"></>
      <div class="participant_details"> 
        <div>${users[i].name}</div> 
        <div>
         <small> ${status} </small>
        </div> 
      </div>
    </div>
    `;
		user_container.appendChild(temp_user);
	}
};