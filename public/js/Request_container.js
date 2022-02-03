let request_map = {};
let request_arr = [];
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
const get_all_requests = async () => {
  let data = await axios.get("/api/all_requests");
  data = data.data.all_requests;
  // console.log(data)
  request_arr = data;
  fill_container_data(data);
  
};
const modal_filler = (id) => {
  let Modal = document.getElementById("Requested_Course"),
    Modal_title = document.getElementById("Requested_Course_Title"),
    Modal_Container = document.getElementById("Requested_Course_container");

  let req = request_map[id];
  let date = new Date(req.RequestedAt);
  Modal_title.innerHTML = req.name;
  let userHeader = ``;
  if (req.user) {
    userHeader = `<div style="margin-top:1%"><b> By - </b><a class="name-link" href="/profile/${req.user.email}">${req.user.name}</a></div>`;
  } else { 
    userHeader = `  <div style="margin-top:1%"><b> By - </b><span>Anonymous</span></div>`;
  }
  Modal_Container.innerHTML = `
  <div class="request_container">
        ${userHeader}
        <div class="request_container_elem"><b>Description: </b>${
					req.requirements
				}</div>
        <small class="request_container_elem" style="text-align:right;">
            ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
        </small>
            </div>
      

    `;
  // document.getElementById("Requested_Course_create").onclick =;
    Modal.click();
  document
		.getElementById("Requested_Course_create")
    .addEventListener("click", function () { checkIfVerified(id) });

};
const fill_container_data = (data) =>{
  let requests_container = document.getElementById("requests_container"),temp = ""; 
  data.forEach((req) => {
    request_map[req._id] = req;
    let date = new Date(req.RequestedAt);
    temp += `
        <div class="request">
            <div  class="request_elem">
            <h4 style="color:rgb(79, 70, 229)">${req.name}</h4>
            </div>
            <small class="request_elem">
            ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
            </small>
            <div class="request_elem" style="height:50%;">${req.requirements}</div>
            <div onclick="modal_filler('${
							req._id
						}')" style="margin-left:auto;cursor:pointer;color:rgb(79, 70, 229);">Get more info...</div>
        </div>
     
    `;});
    requests_container.innerHTML = temp;
}
const search_courses = (val)=>{
  val= val.toLowerCase();
     
    let temp_arr = request_arr.filter(elem=>{
      let date = new Date(elem.RequestedAt);
      date= date.getDate()+ "/" +(date.getMonth() + 1) + "/" +date.getFullYear();
       
      return (elem.name.toLowerCase().includes(val)) || (elem.requirements.toLowerCase().includes(val)) || (String(date).includes(val))
    })
    // console.log(temp_arr);
    fill_container_data(temp_arr);
}
const checkIfVerified = (id) => {

  if (isVerified == "true") {
  
    let req = request_map[id];
    document.getElementById("room_name").value=req.name
    document.getElementById("room_description").value = req.requirements;
   
    $("#RoomcreationModal").modal("show");
     	document.getElementById("Requested_Course_close").click();
	} else {
		alert(
			"You are not verified by the administrator yet. If you have not uploaded your government id yet please upload it in the profile section "
		);
	}
};
function modal_submission() {
	// For creating a new room
	let name = document.getElementById("room_name").value;
	let description = document.getElementById("room_description").value;
	//console.log(name, description);
	let room_tags = [];
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
      
              window.location = `/room/${response._id}/`;
				}
			});
		document.getElementById("modal_close").click();
	}
}
get_all_requests();
