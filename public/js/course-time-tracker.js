let main_time_display = document.getElementById("main_time_display");
let all_time_display = document.getElementById("all_time_display");

let date_parser = (date) => {
  date = new Date(date);
  return (
    date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    date.getFullYear() +
    "   " +
    date.getHours() +
    " : " +
    date.getMinutes() +
    " : " +
    date.getSeconds()
  );
};
const get_course_tracker_details = async () => {
  let data = await axios.get(`/api/get_course_tracker_data/${courseID}`);
  data = data.data;
  let course = data.course;
  data = data.req_data;
  let total_time = 0;
  data.forEach((elem) => {
    total_time += elem.duration;
  });
  if (Math.trunc(total_time / 60)) {
    total_time = Math.trunc(total_time / 60);
    if (Math.trunc(total_time / 60))
      total_time = Math.trunc(total_time / 60) + " hrs";
    else total_time += " mins";
  } else total_time += " secs";
  main_time_display.innerHTML = `
      <div>
       <h1>${course.name}</h1> <br>
        <h5>Total Time Spent:</h5><h3> ${total_time}</h3>
        <h5>Total Sessions:</h5><h3> ${data.length}</h3>
        </div>
      `;
  let temp = "";
  data.forEach((elem) => {
    let start_time = date_parser(elem.StartTime),
      end_time = date_parser(elem.EndTime);
    temp += `
            <div class="time_container">
                Session Start Time: ${start_time}<br>
                Session End Time: ${end_time}<br>
                Session Duration: ${elem.duration}<br>
            </div>
        `;
  });

  all_time_display.innerHTML = temp;
};
get_course_tracker_details();
