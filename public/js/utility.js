let val = document.getElementById("navbar_menu").innerHTML;

if (isEducator === "true") {
    //console.log(val); 
    document.getElementById("navbar_menu").innerHTML =
    `<li>
  <a class="dropdown-item" href='/Requested-Courses' type="button">
      <i class="fas fa-user-plus" style="color:black;"></i> Requested <br> Courses</a>
  </li>` + 
      val;
  } else
    document.getElementById("navbar_menu").innerHTML =
      `<li>
  <a class="dropdown-item" href='/tracker' type="button">
      <i class="fas fa-list-ul" style="color:black;"></i> Analysis</a>
  </li>` + val;
  