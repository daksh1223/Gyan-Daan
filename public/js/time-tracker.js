let main_time_display = document.getElementById("main_time_display");
let all_time_display = document.getElementById("all_time_display");

const time_string_maker = (total_time) =>{if (Math.trunc(total_time / 60)) {
  total_time = Math.trunc(total_time / 60);
  if (Math.trunc(total_time / 60))
    total_time = Math.trunc(total_time / 60) + " hrs";
  else total_time += " mins";
} else total_time += " secs";
return total_time;
}
const get_tracker_data = async () => {
  let data = await axios.get("/api/get_tracker_data");
  data = data.data;
  let total_time = 0;
  data.forEach((elem) => {
    total_time += elem.duration;
  });
  total_time = time_string_maker(total_time)
  let user_data = await axios.get("/api/get_user_details");
  user_data = user_data.data;
  main_time_display.innerHTML = `
  <div>
    <h5>Total Time Spent:</h5><h1> ${total_time}</h1> <br>
    <h5>Total Sessions:</h5><h1> ${data.length}</h1>
    </div>
  `;
  let temp='';
  user_data.rooms.forEach(room=>{
      let sessions_len=data.filter(session=>{return session.course==room._id}).length;
      let sessions_time=0;
      data.forEach(session=>{if(session.course==room._id)sessions_time+=session.duration;})
      sessions_time= time_string_maker(sessions_time);
    temp+=`
        <div class="time_container">
            Course Name: <h2>${room.name}</h2>
            Sessions Spent: <h2>${sessions_len}</h2>
            Total Time Spent: <h2>${sessions_time}</h2>
            <a href="/course-tracker/${room._id}" style="margin-left:auto;"> Get more info...</a>
        </div>
    `;
  })
  console.log(data)
  all_time_display.innerHTML=temp;
};
get_tracker_data();
