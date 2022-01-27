const deleteChatDatabase = async (id) => {
	await axios.delete("/api/message", {
		data: {
			message_id: id,
			channel_id: current_channel_message_id,
		},
	});
	deleteChat(id);
	await socket.emit("deleteChat", id);
};
function deleteChat(id) {
	//console.log(channel_data_messages);
	let chat = document.getElementById(id);
	chat.getElementsByClassName("chatContent")[0].innerHTML =
        "This message has been deleted";
    if (channel_data_messages) {
        channel_data_messages.forEach((message) => {
            if (message._id == id) {
                message.message = "This message has been deleted";
            }
        });
    }
	chat.getElementsByClassName("chatFooter")[0].style.display = "none";
	chat.getElementsByClassName("topnav")[0].innerHTML = ``;
	// console.log(channel_data_messages);
}

const editchatHtml = async (id) => {
	let chat = document.getElementById(id);

	if (chat.getElementsByTagName("pre").length == 0) return;
	let replyData = "";
	let chatContent = chat.getElementsByClassName("chatContent")[0].innerHTML;
	let prevVal =
		chat.getElementsByTagName("pre")[
			chat.getElementsByTagName("pre").length - 1
		].innerHTML;
	if (chat.getElementsByClassName("reply").length > 0) {
		replyData =
			'<div class="card shadow reply" style="width:50%;">' +
			chat.getElementsByClassName("reply")[0].innerHTML +
			"</div>";
	}
	chat.getElementsByClassName("chatContent")[0].innerHTML = `
	${replyData}

  <input style="width:100%;" class="w3-input w3-border" type="text" id="chatInput_${id}" value='${prevVal}'>
  <div style="display:flex;justify-content:flex-end;margin-top:2%;">
  <i class="fas fa-times" style="cursor:pointer" id="${id}_cancel"></i>
  <i class="fas fa-check" style="margin-left:3%;cursor:pointer;" onclick="geteditchatData('${id}')"></i>
  </div>

  `;
	document
		.getElementById(`${id}_cancel`)
		.addEventListener("click", function () {
			cancelchatData(id, chatContent);
		});
	chat.getElementsByClassName("topnav")[0].style.display = "none";
	chat.getElementsByClassName("chatFooter")[0].style.display = "none";
	chat.style.width = "60%";
};
const geteditchatData = async (id) => {
	let newchatData = document.getElementById(`chatInput_${id}`).value;
	let replyData = "";
	let chat = document.getElementById(id);
	let timeString = new Date().toLocaleString("en-US", {
		timeZone: "Asia/Kolkata",
	});
	timeString = timeString + " edited";
	if (chat.getElementsByClassName("reply").length > 0) {
		replyData =
			'<div class="card shadow reply">' +
			chat.getElementsByClassName("reply")[0].innerHTML +
			"</div>";
	}
	chat.getElementsByClassName("chatContent")[0].innerHTML =
		replyData + "<pre>" + newchatData + "</pre";
	editchatData(id, newchatData, timeString);
	await socket.emit("editChat", id, newchatData, timeString);
	axios.put("/api/message", {
		message_id: id,
		message_content: replyData + "<pre>" + newchatData + "</pre>",
		message_timestamp: timeString,
	});

    chat.style.width = "fit-content";
    if (channel_data_messages) {
        channel_data_messages.forEach((message) => {
            if (message._id == id) {
                message.message = replyData + "<pre>" + newchatData + "</pre>";
                message.timestamp = timeString;
            }
        });
    }

	chat.getElementsByClassName("chatFooter")[0].innerHTML = timeString;
	chat.getElementsByClassName("topnav")[0].style.display = "flex";
	chat.getElementsByClassName("chatFooter")[0].style.display = "flex";
};
const cancelchatData = (id, prevData) => {
	let chat = document.getElementById(id);

	chat.getElementsByClassName("chatContent")[0].innerHTML = prevData;

	chat.style.width = "fit-content";
	chat.getElementsByClassName("chatHeader")[0].style.display = "flex";
	chat.getElementsByClassName("chatFooter")[0].style.display = "flex";
	chat.getElementsByClassName("topnav")[0].style.display = "flex";
};
function editchatData(id, newChat, timeString) {
	let chat = document.getElementById(id);
	chat.getElementsByTagName("pre")[
		chat.getElementsByTagName("pre").length - 1
	].innerHTML = newChat;
	chat.getElementsByClassName("chatFooter")[0].innerHTML = timeString;
}
const replychatHtml = (id, username) => {
	let chat = document.getElementById(id);
	let chatContent = chat.getElementsByClassName("chatContent")[0].innerHTML;
	let mes;
	if (chat.getElementsByTagName("pre").length) {
		mes = `<div>${
			chat.getElementsByTagName("pre")[
				chat.getElementsByTagName("pre").length - 1
			].innerHTML
		}</div>`;
	} else {
		if (chat.getElementsByClassName("meet").length) {
			mes = `<div class="meet">${
				chat.getElementsByClassName("meet")[0].innerHTML
			}</div>`;
		} else {
			return;
		}
	}

	chat.getElementsByClassName("chatContent")[0].innerHTML = `
	<div class="card shadow" style="width:50%;color:black;margin-bottom:1%">
    <strong>${username}</strong>
   
      ${mes}
 

	  </div>
  <input style="width:100%;" class="w3-input w3-border" type="text" id="chatInput_${id}">
  <div style="display:flex;justify-content:flex-end;margin-top:2%;">
  <i class="fas fa-times" style="cursor:pointer" id="${id}_cancel"></i>
  <i class="fas fa-check" style="margin-left:3%;cursor:pointer;" id="${id}_replyCheck" ></i>
  </div>

  `;
	chat.getElementsByClassName("topnav")[0].style.display = "none";

	document
		.getElementById(`${id}_replyCheck`)
		.addEventListener("click", function () {
			replytoChat(id, mes, chatContent, username);
		});
	document
		.getElementById(`${id}_cancel`)
		.addEventListener("click", function () {
			cancelchatData(id, chatContent);
		});
	chat.style.width = "60%";
	chat.getElementsByClassName("chatHeader")[0].style.display = "none";
	chat.getElementsByClassName("chatFooter")[0].style.display = "none";
};
const replytoChat = (id, mes, chatContent, username) => {
	let chatmes = `
	<div style="color:back;" class="card shadow reply">
	<div onclick="scrollto('${id}')" style="cursor:pointer">
    <strong>${username}</strong>
    <div>
      ${mes}
    </div>
</div>
	  </div>
    `;
	// console.log(chat);
	let msg =
		chatmes +
		"<pre>" +
		document.getElementById(`chatInput_${id}`).value +
		"</pre>";
	cancelchatData(id, chatContent);
	send_chat_message(msg);
};
const scrollto = (id) => {
	if (document.getElementById(id)) {
		$("#chat_messages").scrollTop($("#chat_messages").position().top);
		$("#chat_messages").scrollTop($(`#${id}`).position().top);
		let el = document.getElementById(id);
		let b = el.style.backgroundColor;
		let c = el.style.color;
		el.style.backgroundColor = "darkslateblue";
		el.style.color = "white";
		el.style.border = "3px solid";

		setTimeout(() => {
			el.style.backgroundColor = b;
			el.style.color = c;
			el.style.border = "none";
		}, 1000);
	}
};
const getNavHtml = (type, user_name, message_id, is_user_post) => {
	if (type == "message" || type == "meet") {
		if (is_user_post) {
			return `
   <div class="dropdown topnav" id='nav_${message_id}'>
                        <div class="dropdown-toggle nav-link active message-dropdown-toggle"  role="button"
                            data-toggle="dropdown" aria-expanded="false">
                           
                          
                           <span class="material-icons" style="color:white">
more_vert
</span> 
                        </div>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      
                            <li  class="messageOptions" onclick="replychatHtml('${message_id}','${user_name}')">
                   
                               <i class="fas fa-reply" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Reply</p>

                            </li>
                         
                            <li class="messageOptions" onclick="editchatHtml('${message_id}')">
                   
                               <i class="fas fa-edit" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Edit</p>

                            </li>
                         
              
                              <li class="messageOptions"onclick="deleteChatDatabase('${message_id}')">
                               <i class="far fa-trash-alt" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Delete</p>

                            </li>
                       
                                               </ul>
                    </div>
                </li>
            </ul>
        </div>`;
		} else {
			return `   <div class="dropdown topnav" id='nav_${message_id}'>
                        <div class="dropdown-toggle nav-link active message-dropdown-toggle"  href='#' role="button"
                            data-toggle="dropdown" aria-expanded="false">
                           
                          
                           <span class="material-icons">
more_vert
</span> 
                        </div>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      
                            <li  class="messageOptions" onclick="replychatHtml('${message_id}','${user_name}')">
                   
                               <i class="fas fa-reply" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Reply</p>

                            </li>
						</ul>
        </div>`;
		}
	}

	if (type == "file") {
		if (is_user_post) {
			return `
      <div class="dropdown topnav" id='nav_${message_id}'>
                        <div class="dropdown-toggle nav-link active message-dropdown-toggle"  role="button"
                            data-toggle="dropdown" aria-expanded="false">
                           
                          
                           <span class="material-icons" style="color:white">
more_vert
</span> 
                        </div>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      
                            <li  class="messageOptions" onclick="replychatHtml('${message_id}','${user_name}')">
                   
                               <i class="fas fa-reply" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Reply</p>

                            </li>
                         
              
                              <li class="messageOptions"onclick="deleteChatDatabase('${message_id}')">
                               <i class="far fa-trash-alt" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Delete</p>

                            </li>
                       
                                               </ul>
                    </div>
                </li>
            </ul>
        </div>`;
		} else {
			return `    <div class="dropdown topnav" id='nav_${message_id}'>
                        <div class="dropdown-toggle nav-link active message-dropdown-toggle"  href='#' role="button"
                            data-toggle="dropdown" aria-expanded="false">
                           
                          
                           <span class="material-icons">
more_vert
</span> 
                        </div>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      
                            <li  class="messageOptions" onclick="replychatHtml('${message_id}','${user_name}')">
                   
                               <i class="fas fa-reply" aria-hidden="true" style="height:fit-content;margin-left:20%;"></i>
                               <p style="margin:0%;margin-left:2%;">Reply</p>

                            </li>
						</ul>
        </div>`;
		}
	}

	return ``;
};
