let main_time_display = document.getElementById("main_time_display");
let all_time_display = document.getElementById("all_time_display");
let colors = [
  "FF6347",
  "ff033e",
  "008000",
  "ff2052",
  "007fff",
  "cd5b45",
  "e3256b",
  "ff3800",
  "e30022",
];

let duration_parser = (duration) => {
  if (Math.trunc(duration / 60)) {
    duration = Math.trunc(duration / 60);
    if (Math.trunc(duration / 60)) {
      duration = Math.trunc(duration / 60);
      if (duration > 1) {
        duration += " hrs";
      } else duration += " hr";
    } else {
      if (duration > 1) {
        duration += " mins";
      } else duration += " min";
    }
  } else if (duration > 1) {
    duration += " secs";
  } else duration += " sec";

  return duration;
};
const get_tracker_data = async () => {
  let data = await axios.get("/api/get_tracker_data");
  data = data.data;
  let total_time = 0,
    progress_data = [],
    total_value = 0;

  data.forEach((elem) => {
    total_time += elem.duration;
  });
  total_value = total_time;
  total_time = duration_parser(total_time);
  let user_data = await axios.get("/api/get_user_details");
  user_data = user_data.data;
  main_time_display.innerHTML += `
    <div style=" padding: 2%;">
        <h5>Total Time Spent:</h5><h1 style="color:rgb(79, 70, 229)"> ${total_time}</h1> <br>
        <h5>Total Sessions:</h5><h1 style="color:rgb(79, 70, 229)"> ${data.length}</h1>
    </div>
  `;
  let temp = "";
  user_data.rooms.forEach((room) => {
    let sessions_len = data.filter((session) => {
      return session.course == room._id;
    }).length;
    let sessions_time = 0;
    data.forEach((session) => {
      if (session.course == room._id) sessions_time += session.duration;
    });
    progress_data.push([room.name, sessions_time]);
    sessions_time = duration_parser(sessions_time);
    temp += `
        <div class="time_container">
            Course Name: <h2 style="color:rgb(79, 70, 229)">${room.name}</h2>
            Sessions Spent: <h2 style="color:rgb(79, 70, 229)">${sessions_len}</h2>
            Total Time Spent: <h2 style="color:rgb(79, 70, 229)">${sessions_time}</h2>
            <a href="/course-tracker/${room._id}" style="margin-left:auto;color:rgb(79, 70, 229);text-decoration:none;"> Get more info...</a>
        </div>
    `;
  });
  let progress_bar = document.getElementById("progress-bar");
  let i = 0;
  progress_data.forEach((val) => {
    let percentage = (val[1] / total_value) * 100;
    progress_bar.innerHTML += `
      <div class="progress_bar_elem" style="width:${percentage}%;background-color:#${colors[i % colors.length]};" title="${val[0]} - ${Math.round(
      percentage
    )}% of total time spent here"><span>${val[0]}</span></div>
    `;
    i++;
  });
  all_time_display.innerHTML += temp;
};
get_tracker_data();
