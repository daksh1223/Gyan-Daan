let main_time_display = document.getElementById("main_time_display");
let modal_container = document.getElementById("Course_sessions_container");
let all_time_display = document.getElementById("all_time_display");
let sessions_storage = {};
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
let date_extracter = (elem) => {
  elem = new Date(elem);
  return (
    zero_adder(elem.getDate()) +
    " / " +
    zero_adder(elem.getMonth() + 1) +
    " / " +
    elem.getFullYear()
  );
};
const get_course_tracker_details = async () => {
  let data = await axios.get(`/api/get_course_tracker_data/${courseID}`);
  data = data.data;
  let course = data.course;
  data = data.req_data;
  data.reverse();
  let total_time = 0;
  data.forEach((elem) => {
    total_time += elem.duration;
  });
  total_time = duration_parser(total_time);
  main_time_display.innerHTML += `
      <div style=" padding: 2%;">
       <h1 style="color:rgb(79, 70, 229)">${course.name}</h1>
        <h5>Total Time Spent:</h5><h3 style="color:rgb(79, 70, 229)"> ${total_time}</h3>
        <h5>Total Sessions:</h5><h3 style="color:rgb(79, 70, 229)"> ${data.length}</h3>
        </div>
      `;
  let temp_arr = [],
    cnt = 0,
    curr_duration = 0,
    curr_data = -1;
  data.forEach((elem) => {
    if (curr_data == -1) {
      curr_data = date_extracter(elem.StartTime);
      cnt = 1;
      curr_duration += elem.duration;
      temp_arr.push(elem);
    } else {
      if (curr_data != date_extracter(elem.StartTime)) {
        sessions_storage[curr_data] = temp_arr;
        curr_duration = duration_parser(curr_duration);
        let temp = "";
        temp += `
          <div class="time_container">
              <div>Date: ${curr_data}</div>
              <div>Total Sessions: ${cnt}</div>
              <div>Total Duration: ${curr_duration}</div>
              <div style="margin-left:auto;cursor:pointer;color:rgb(79, 70, 229)" onclick="modal_vals('${curr_data}')">Get more Info....</div>
          </div>
        `;
        all_time_display.innerHTML += temp;
        curr_data = date_extracter(elem.StartTime);
        cnt = 1;
        curr_duration = elem.duration;
        temp_arr = [];
        temp_arr.push(elem);
      } else {
        temp_arr.push(elem);
        curr_duration += elem.duration;
        cnt++;
      }
    }
  });

  sessions_storage[curr_data] = temp_arr;
  curr_duration = duration_parser(curr_duration);
  let temp = "";
  temp += `
          <div class="time_container">
              <div>Date: ${curr_data}</div>
              <div>Total Sessions: ${cnt}</div>
              <div>Total Duration: ${curr_duration}</div>
              <div style="margin-left:auto;cursor:pointer;color:rgb(79, 70, 229)" onclick="modal_vals('${curr_data}')">Get more Info....</div>
          </div>
        `;
  all_time_display.innerHTML += temp;
};

let modal_vals = (data) => {
  let temp = "";
  data = sessions_storage[data];
  let cnt = 1;
  data.forEach((elem) => {
    let start_time = date_parser(elem.StartTime),
      end_time = date_parser(elem.EndTime),
      duration = duration_parser(elem.duration);
    temp += `
            <div class="time_container" style="padding:5%">
                <h5> Session ${cnt}</h5>
                <div>Start Time: ${start_time}</div>
                <div>End Time: ${end_time}</div>
                <div>Duration: ${duration}</div>
            </div>
        `;
    cnt++;
  });
  modal_container.innerHTML = temp;
  document.getElementById("Course_tracker").click();
};
get_course_tracker_details();
