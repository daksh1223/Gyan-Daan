let rooms_copy = []; // It will contain all the rooms that the user can access
let rooms = []; // The rooms that the user can access and which contains the string typed in the search bar
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
let rooms_container = document.getElementById("rooms_container"); // Container that contains all rooms in which the user is present
let user_container = document.getElementById("all_users_container"); // Container that contains all the users

function modal_submission() {
  // For creating a new room
  let name = document.getElementById("room_name").value;
  let description = document.getElementById("room_description").value;
  console.log(name, description);
  let room_tags = document.getElementById("room_tags").value;
  room_tags = room_tags.split(",");
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
        console.log(response);
        if (response != "Permission Denied!") {
          rooms_copy.push(response); // After successful creation of a room add that in the rooms_copy and also add it in the front end
          add_room(response._id, response.name, response.room_color);
        }
      });
    document.getElementById("modal_close").click();
  }
}
async function get_rooms() {
  response = await axios.get("/api/get_all_rooms"); // Will fetch all the rooms where the user is present
  rooms_copy = response.data.rooms;
  let room_create = document.getElementById("room_create");
  if (isEducator)
    room_create.innerHTML = `<i class="fas fa-user-plus"></i> Create a new Course</a>`;
  show_rooms("");
}

function show_rooms(prefix) {
  // Will be used to show the rooms
  prefix = prefix.toLowerCase();
  let rooms = rooms_copy.map((room) => {
    // Now the room will contain all the rooms that contains particular string that is typed in the search bar
    let name = room.name.toLowerCase();
    if (name.includes(prefix)) {
      return room;
    }
  });

  while (rooms_container.firstChild) {
    rooms_container.removeChild(rooms_container.firstChild); // First remove all the previous present rooms in the container
  }
  for (let i = 0; i < rooms.length; i++) {
    if (!rooms[i]) continue;
    add_room(rooms[i]._id, rooms[i].name, rooms[i].room_color); // Then add the rooms that fullfill all the conditions
  }
}

async function show_users() {
  let response = await axios.get("/api/get_users"); // Will fetch all the users present in the true-meet organization

  while (user_container.firstChild) {
    user_container.removeChild(user_container.firstChild);
  }
  for (var i = 0; i < response.data.length; i++) {
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
function add_room(id, room_name, room_color) {
  let room = document.createElement("a");
  room.setAttribute("href", "/room/" + id + "/");
  icon = document.createElement("div");
  let icon_value = room_name[0].toUpperCase(); // If minimum two letters are present then the icon value will be of size 2 else 1
  if (room_name.length > 1) {
    icon_value += room_name[1].toUpperCase();
  }
  room.innerHTML = `
     <div class="icon">
        <img src="https://place-hold.it/100/${room_color}/fff&text=${icon_value}&fontsize=20" style="border-radius:4px;height:40%;width:40%;"></img>
     </div>
     <div class="room">
        ${room_name} 
     </div>
    `;
  room.setAttribute("class", "room_card");
  rooms_container.appendChild(room);
}
get_rooms();
