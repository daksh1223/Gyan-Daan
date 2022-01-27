let request_map = {};
let request_arr = [];
const get_all_requests = async () => {
  let data = await axios.get("/api/all_requests");
  data = data.data.all_requests;
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
  Modal_Container.innerHTML = 
  `
  <div class="request_container">
        <div class="request_container_elem"><b>Description: </b><br>${req.requirements}</div>
        <small class="request_container_elem" style="text-align:right;">
            ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
        </small>
    </div>
  
    `;
  Modal.click();
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
            }')" style="margin-left:auto;cursor:pointer;margin-top:auto;color:rgb(79, 70, 229);">Get more info...</div>
        </div>̥
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
    console.log(temp_arr);
    fill_container_data(temp_arr);
}
get_all_requests();
