let rooms_copy = []; // It will contain all the rooms that the user can access
let rooms = []; // The rooms that the user can access and which contains the string typed in the search bar
let stat_rooms_copy = []
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
let stats = ['oldest', 'popular', 'latest', 'liked']
let rooms_container = document.getElementById("rooms_container"); // Container that contains all rooms in which the user is present
let user_container = document.getElementById("all_users_container"); // Container that contains all the users
let stat_rooms_container = document.getElementById('stat_rooms_container');
let like_icons = {}, like_counts = {};

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

          add_room(response, rooms_container);
        }
      });
    document.getElementById("modal_close").click();
  }
}
async function get_rooms(stat) {
  response = await axios.get("/api/get_all_rooms"); // Will fetch all the rooms where the user is present
  rooms_copy = response.data.rooms;
  if (isEducator === 'true') {
    rooms_copy=rooms_copy.filter((room)=>{return room.creator===user_id })
  }
  let room_create = document.getElementById("room_create");
  if (isEducator != "false") {
    room_create.innerHTML = `<i class="fas fa-user-plus"></i> Create a new Course</a>`;
  }
  show_rooms("");
  if (!(isEducator==='true'))
  {
    console.log(stat)
    switch (stat) {
    case 'popular': { response = await axios.get(`/api/get_popular_rooms`); }
      break;
    case 'oldest': { response = await axios.get(`/api/get_oldest_rooms`); }
      break;
    case 'latest': { response = await axios.get(`/api/get_latest_rooms`); }
      break;
    case 'liked': { response = await axios.get(`/api/get_most_liked_rooms`); }
      break;
  }
  stat_rooms_copy = response.data
    show_stat_rooms(stat_rooms_copy)
  }
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
    add_room(rooms[i], rooms_container); // Then add the rooms that fullfill all the conditions
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
function add_room(cur_room, rooms_container) {
  let room_name = cur_room.name, id = cur_room._id, room_color = cur_room.room_color
  let room = document.createElement("div");
  let icon_value = room_name[0].toUpperCase(); // If minimum two letters are present then the icon value will be of size 2 else 1
  if (room_name.length > 1) {
    icon_value += room_name[1].toUpperCase();
  }
  let join_icon = ''
  like_counts[`${id}`]=cur_room.likeCount
  if (cur_room.likes.includes(user_id)) {
    like_icons[`${id}`] = '<i title="Liked" class="fas fa-thumbs-up"></i>'
  }
  else like_icons[`${id}`] = '<i title="Like" class="far fa-thumbs-up"></i>'
  if (!cur_room.users.includes(user_id)) join_icon = `<button title="Join" class="btn btn-primary" id="join_icon_${id}" onClick="joinRoom('${id}')" style="cursor:pointer;">Enroll</button>`
  room.innerHTML = `
     <div class="icon">
        <a href="/room/${id}/"><img src="https://place-hold.it/100/${room_color}/fff&text=${icon_value}&fontsize=20" style="border-radius:4px;height:40%;width:40%;"></img></a>
     </div>
     <div class="room">
     <small style="float:left; cursor:pointer;" class="like_icon_${id}" onClick="toggleLike('${id}')">
      ${like_icons[`${id}`]}
      ${like_counts[`${id}`]}
      </small>
        ${room_name} 
      <small title="Total Students" class="user_count_${id}" style="float:right;">${cur_room.userCount}</small>
     </div>
     <div class="room"> ${join_icon}</div>
    `;
  room.setAttribute("class", "room_card");
  rooms_container.appendChild(room);
}

function show_stat_rooms(rooms) {
  while (stat_rooms_container.firstChild) {
    stat_rooms_container.removeChild(stat_rooms_container.firstChild); // First remove all the previous present rooms in the container
  }
  for (let i = 0; i < rooms.length; i++) {
    if (!rooms[i]) continue;
    add_room(rooms[i], stat_rooms_container); // Then add the rooms that fullfill all the conditions
  }
}

function activate_stat_link(stat) {
  document.getElementById(`${stat}_stat_link`).setAttribute('class', 'active')
}

function deactivate_stat_links() {
  stats.forEach(element => {
    document.getElementById(`${element}_stat_link`).removeAttribute("class", "active")
  })
}

function stat_link_click(stat) {
  deactivate_stat_links()
  activate_stat_link(stat)
  get_rooms(stat)
}

async function toggleLike(id) {
  const like_buttons = document.getElementsByClassName(`like_icon_${id}`)
  if (like_icons[`${id}`] === '<i title="Liked" class="fas fa-thumbs-up"></i>') {
    like_icons[`${id}`] = '<i title="Like" class="far fa-thumbs-up"></i>';
    like_counts[`${id}`]-=1
  }
  else {
    like_icons[`${id}`] = '<i title="Liked" class="fas fa-thumbs-up"></i>'
    like_counts[`${id}`]+=1
  }
  for (let i = 0; i < like_buttons.length; i++) {
    like_buttons[i].innerHTML = `${like_icons[`${id}`]} ${like_counts[`${id}`]}`  
  }
  await axios.post(`/api/room/${id}/toggle_like`)
}

async function joinRoom(id) {
  document.getElementById(`join_icon_${id}`).remove()
  const room = stat_rooms_copy.find((element) => { return (element._id === id) })
  room.users.push(user_id)
  room.userCount += 1
  const user_counts = document.getElementsByClassName(`user_count_${id}`)
  for (let i = 0; i < user_counts.length; i++){
    user_counts[i].innerHTML = room.userCount;
  }
  add_room(room, rooms_container)
  await axios.post(`/api/room/${id}/join`)
}

get_rooms('popular');
