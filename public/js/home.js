let rooms_copy = []; // It will contain all the rooms that the user can access
let rooms = []; // The rooms that the user can access and which contains the string typed in the search bar
let stat_rooms_copy = [];
let colors = [
	// Contains 11 colors which will be used to decide the color of a new room
	"800080",
	"FF6347",
	"ff033e",
	"008000",
	"ff2052",
	"007fff",
	"cd5b45",
	"e3256b",
	"ff3800",
	"e30022",
	"0000ff",
];
let stats = ["enrolled","oldest", "popular", "latest", "liked"];
let rooms_container = document.getElementById("rooms_container"); // Container that contains all rooms in which the user is present
let rooms_container_title = document.getElementById("rooms_container_title");
let educators_container = document.getElementById("educators_container");
let educators_container_title = document.getElementById(
	"educators_container_title"
);
let user_container = document.getElementById("all_users_container"); // Container that contains all the users
// let stat_rooms_container = document.getElementById("stat_rooms_container");
let like_icons = {},
	like_counts = {};
// let val = document.getElementById("navbar_menu").innerHTML;

// if (isEducator === "true") {
// 	console.log(val);
// 	document.getElementById("navbar_menu").innerHTML =
// 		`<li>
//   <a class="dropdown-item" href='/Requested-Courses' type="button">
//       <i class="fas fa-user-plus" style="color:black;"></i> Requested<br>Courses</a>
// </li>` + val;
// } else
// 	document.getElementById("navbar_menu").innerHTML =
// 		`<li>
// <a class="dropdown-item" href='/tracker' type="button">
//     <i class="fas fa-list-ul" style="color:black;"></i> Analysis</a>
// </li>` + val;
function modal_submission() {
	// For creating a new room
	let name = document.getElementById("room_name").value;
	let description = document.getElementById("room_description").value;
	//console.log(name, description);
	let room_tags = []
	if (document.getElementById("room_tags").value) {
		room_tags = document.getElementById("room_tags").value;
		room_tags = room_tags.split(",");
	}
	if (name.length) {
		roominfo = {
			name,
			room_tags,
			color: colors[Math.floor(Math.random() * 1000) % colors.length],
			description,
		};

		axios
			.post("home/add_room", {
				data: { roominfo },
			})
			.then((response) => {
				response = response.data;
				//console.log(response);
				if (response != "Permission Denied!") {
					rooms_copy.push(response); // After successful creation of a room add that in the rooms_copy and also add it in the front end

					add_room(response, rooms_container);
				}
			});
		document.getElementById("modal_close").click();
	}
}
function Roomrequest_submission() {
	let name = document.getElementById("Roomrequest_name").value;
	let requirements = document.getElementById("Roomrequest_description").value;
	let tags = document.getElementById("Roomrequest_tags").value;
	if (name.length == 0) return;
	axios.post("/api/course_request", {
			name: name,
			requirements: requirements,
			tags: tags,
		});

	document.getElementById("Requestmodal_close").click();
	document.getElementById("Roomrequest_name").value = "";
	document.getElementById("Roomrequest_description").value = "";
	$("#Roomrequest_tags").tagsinput("removeAll");


	
}
async function get_rooms(stat) {
	response = await axios.get("/api/get_all_rooms"); // Will fetch all the rooms where the user is present
	rooms_copy = response.data.rooms;

	//console.log('rooms copy ---', rooms_copy, isEducator, stat);
	if (isEducator == "true") {
		
		rooms_copy = rooms_copy.filter((room) => {
			return room.creator == user_id;
		});
	}
//console.log("rooms copy ---", rooms_copy, isEducator, stat);
	if (isEducator != "false") {
		document.getElementById(
			"createRequestLink"
		).innerHTML = `<h6 class="cus-nav-link nav-link" style="cursor:pointer;"  onclick="checkIfVerified()"><i class="fas fa-user-plus"></i> Create a new Course</h6>`;
	} else {
		document.getElementById(
			"createRequestLink"
		).innerHTML = `<h6 class="cus-nav-link nav-link" style="cursor:pointer;" data-toggle="modal"  data-target="#RoomrequestModal"><i class="fas fa-user-plus"></i> Request for a new Course</h6>`;
	}
	// showSearchResults("");
	// show_stat_rooms(rooms_copy);
	if (!(isEducator === "true")) {
		//console.log(stat);
		switch (stat) {
			case "popular":
				{
					response = await axios.get(`/api/get_popular_rooms`);
				}
				break;
			case "oldest":
				{
					response = await axios.get(`/api/get_oldest_rooms`);
				}
				break;
			case "latest":
				{
					response = await axios.get(`/api/get_latest_rooms`);
				}
				break;
			case "liked":
				{
					response = await axios.get(`/api/get_most_liked_rooms`);
				}
				break;
			case "enrolled":
				{
					showSearchResults("");
					return;
				}
			
		}
		stat_rooms_copy = response.data;

		show_stat_rooms(stat_rooms_copy);
	} else { 
			showSearchResults("");
	}
}

async function showSearchResults(searchString) {
	if (searchString.length) {
		searchString = searchString.toLowerCase();
		//console.log("searching.... ", searchString);
		let findTags = searchString.split(" ");
		//console.log(findTags);
		let data = await axios.post("/api/search", { findTags });
		//console.log(data.data);
		// Will be used to show the rooms
		let rooms = data.data.rooms;
		let users = data.data.users;
		stat_rooms_copy = rooms.map((room) => { return room.room});
		//console.log('----', rooms, users)

		while (rooms_container.firstChild) {
			rooms_container.removeChild(rooms_container.firstChild); // First remove all the previous present rooms in the container
		}
		while (educators_container.firstChild) {
			educators_container.removeChild(educators_container.firstChild); // First remove all the previous present rooms in the container
		}
		rooms_container_title.style.display = "block";
		educators_container_title.style.display = "block";
		if (rooms.length) {
			rooms_container_title.innerHTML = "Courses-";
			for (let i = 0; i < rooms.length; i++) {
				// if (!rooms[i]) continue;
				add_room(rooms[i].room, rooms_container); // Then add the rooms that fullfill all the conditions
			}
		} else {
			rooms_container_title.innerHTML = "No courses for this search";
		}

		if (users.length) {
			educators_container_title.innerHTML = "Educators-";
			for (let i = 0; i < users.length; i++) {
				// if (!rooms[i]) continue;
				add_user(users[i].user, educators_container);
			}
		} else {
			educators_container_title.innerHTML = "No educators for this search";
		} // Then add the rooms that fullfill all the conditions
	} else {


    deactivate_stat_links();
    activate_stat_link("enrolled");

		while (rooms_container.firstChild) {
			rooms_container.removeChild(rooms_container.firstChild); // First remove all the previous present rooms in the container
		}
		while (educators_container.firstChild) {
			educators_container.removeChild(educators_container.firstChild); // First remove all the previous present rooms in the container
		}
		// rooms_container_title.style.display = "block";
		// rooms_container_title.innerHTML = "Enrolled courses -";
		for (let i = 0; i < rooms_copy.length; i++) {
			// if (!rooms[i]) continue;
      //console.log(rooms_copy[i],rooms_container)
			add_room(rooms_copy[i], rooms_container); // Then add the rooms that fullfill all the conditions
		}
    
	}
}

async function show_users() {
	let response = await axios.get("/api/get_users"); // Will fetch all the users present in the GyanDaan organization

	while (user_container.firstChild) {
		user_container.removeChild(user_container.firstChild);
	}
	for (let i = 0; i < response.data.length; i++) {
		temp_user = document.createElement("div");
		temp_user.innerHTML = `
      <div>
        <div style="float:left;" >${response.data[i].name}</div>
        <div style="float:right" >${response.data[i].email}</div>
      </div>
      <br>
    `;
		user_container.appendChild(temp_user); // Add those users in the container
	}
}
function add_room(cur_room, container) {
	let room_name = cur_room.name,
		id = cur_room._id,
		room_color = cur_room.room_color;
	let room = document.createElement("div");
	let icon_value = room_name[0].toUpperCase(); // If minimum two letters are present then the icon value will be of size 2 else 1
	if (room_name.length > 1) {
		icon_value += room_name[1].toUpperCase();
	}
	let join_icon = "";
	if (isEducator=="false" && !cur_room.users.includes(user_id)) {
		join_icon = `<div class="nav-link-par" style="float:right; color: rgb(79, 70, 229);"><div title="Join" class="cus-nav-link nav-link" id="join_icon_${id}" onClick="joinRoom('${id}')" style="cursor:pointer;margin-left:auto;">Enroll</div></div>`;
	}

	like_counts[`${id}`] = cur_room.likeCount;
	if (cur_room.likes.includes(user_id)) {
		like_icons[`${id}`] = '<i title="Liked" class="fas fa-thumbs-up"></i>';
	} else like_icons[`${id}`] = '<i title="Like" class="far fa-thumbs-up"></i>';
	room.innerHTML = `
     <div style="height:60%">
        <a href="/room/${id}/" class="icon"><img src="https://place-hold.it/200/${room_color}/fff&text=${icon_value}&fontsize=50"  ></a>
     </div>
	 <div class="room_content">
	  <div class="room">${room_name}</div>
	 <div class="room_description">${cur_room.description}
	 </div>

	
	 	  <div class="room_bottom"> 
	 <small style="float: left;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
	margin-left: 1%;" class="like_icon_${id}" onClick="toggleLike('${id}')">
	<div>
      ${like_icons[`${id}`]}
      ${like_counts[`${id}`]}
	  </div>
      </small>
	    
			${join_icon}

		</div>
		</div>
	 `;
	room.setAttribute("class", "room_card");
  container.appendChild(room);
  //console.log(container);
}
function add_user(user, rooms_container) {
	let user_name = user.name,
		user_email = user.email,
		user_profilepicUrl = user.profilepicUrl;
	let userDiv = document.createElement("a");

	userDiv.innerHTML = `
     <div style="height:70%">
	 <div class="icon">
      <img src=${user_profilepicUrl}>
	  </div>
     </div>
	 <div class="room">${user_name}</div>
	 `;
	userDiv.setAttribute("class", "room_card");
	userDiv.setAttribute("href", `/profile/${user_email}`);
	rooms_container.appendChild(userDiv);
}

function show_stat_rooms(rooms) {
	while (rooms_container.firstChild) {
		rooms_container.removeChild(rooms_container.firstChild); // First remove all the previous present rooms in the container
  }
  	while (educators_container.firstChild) {
			educators_container.removeChild(educators_container.firstChild); // First remove all the previous present rooms in the container
		}
	for (let i = 0; i < rooms.length; i++) {
		if (!rooms[i]) continue;
		add_room(rooms[i], rooms_container); // Then add the rooms that fullfill all the conditions
	}
}

function activate_stat_link(stat) {
	if (document.getElementById(`${stat}_stat_link`)) {
		document
			.getElementById(`${stat}_stat_link`)
			.setAttribute("class", "nav-link-par active");
	}
     educators_container_title.style.display = "none";
			rooms_container_title.style.display = "none";
}

function deactivate_stat_links() {
	stats.forEach((element) => {
		if (document
		.getElementById(`${element}_stat_link`)) {
			document
				.getElementById(`${element}_stat_link`)
			.setAttribute("class", "nav-link-par");
		};
})
}

function stat_link_click(stat) {
	deactivate_stat_links();
	activate_stat_link(stat);
	get_rooms(stat);
}

async function toggleLike(id) {
	const like_buttons = document.getElementsByClassName(`like_icon_${id}`);
	if (
		like_icons[`${id}`] === '<i title="Liked" class="fas fa-thumbs-up"></i>'
	) {
		like_icons[`${id}`] = '<i title="Like" class="far fa-thumbs-up"></i>';
		like_counts[`${id}`] -= 1;
	} else {
		like_icons[`${id}`] = '<i title="Liked" class="fas fa-thumbs-up"></i>';
		like_counts[`${id}`] += 1;
	}
	for (let i = 0; i < like_buttons.length; i++) {
		like_buttons[i].innerHTML = `<div>${like_icons[`${id}`]} ${
			like_counts[`${id}`]
		}</div>`;
	}
	await axios.post(`/api/room/${id}/toggle_like`);
}

async function joinRoom(id) {
	document.getElementById(`join_icon_${id}`).remove();
	const room = stat_rooms_copy.find((element) => {
		return element._id === id;
	});
	room.users.push(user_id);
	room.userCount += 1;
	const user_counts = document.getElementsByClassName(`user_count_${id}`);
	for (let i = 0; i < user_counts.length; i++) {
		user_counts[i].innerHTML = room.userCount;
	}
	//add_room(room, rooms_container);
	rooms_copy.push(room);
	await axios.post(`/api/room/${id}/join`);
}
const checkIfVerified = () => {
	if (isVerified == "true") {
		$("#RoomcreationModal").modal("show");
	} else {
		alert(
			"You are not verified by the administrator yet. If you have not uploaded your government id yet please upload it in the profile section "
		);
	}
};
// const searchHandler = async(searchString) => {
//   console.log('searching.... ',searchString);
//   let findTags = searchString.split(" ");
//   console.log(findTags);
//   let data = await axios.post('/api/search', { findTags });
//   console.log(data);

// }

get_rooms("enrolled");
