// Calculating the width so that we can add n videos in the container.
function width_calculator(
  temp_width,
  Count,
  container_width,
  container_height,
  margin = 10
) {
  let i = (w = 0);
  let h = temp_width * 0.75 + margin * 2;
  while (i < Count) {
    if (w + temp_width > container_width) {
      w = 0;
      h = h + temp_width * 0.75 + margin * 2;
    }
    w = w + temp_width + margin * 2;
    i++;
  }
  if (h > container_height) return false;
  else return temp_width;
}
// Will be used to set the optimal width and height of each video.
function resize() {
  let Margin = 4;
  let video_grid = document.getElementById("video-grid");
  let Width = video_grid.offsetWidth - Margin * 2;
  let Height = video_grid.offsetHeight - Margin * 2;
  // console.log(pinned_user,Width,Height);
  if (!pinned_user) {
    let media_container = document.getElementsByClassName(
      "remote-stream-container"
    );
    let max = 0;
    let i = 1;
    while (i < 5000) {
      let w = width_calculator(
        i,
        media_container.length,
        Width,
        Height,
        Margin
      );
      if (w === false) {
        max = i - 1;
        break;
      }
      i++;
    }
    max = max - Margin * 2;
    setWidth(max, Margin);
  } else {
    let stream_container = document.getElementById(pinned_user + "_container");
    stream_container.style.width = document.getElementById("left").style.width;
    stream_container.style.height = Height + Margin * 2 + "px";
  }
}

// Set Width and Margin
function setWidth(width, margin) {
  let media_container = document.getElementsByClassName(
    "remote-stream-container"
  );
  for (var s = 0; s < media_container.length; s++) {
    media_container[s].style.width = width + "px";
    media_container[s].style.margin = margin + "px";
    media_container[s].style.height = width * 0.75 + "px";
  }
}

// Will resize the container when ever there is a change in window size
window.addEventListener(
  "load",
  function (event) {
    resize();
    window.onresize = resize;
  },
  false
);
