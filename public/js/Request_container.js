const get_all_requests = async () => {
  let requests_container = document.getElementById("requests_container");
  console.log(requests_container);
  let data = await axios.get("/api/all_requests");
  console.log(data.data);
  data = data.data;
  let temp = "";
  data.forEach((req) => {
    let date = new Date(req.RequestedAt);
    temp += `
        <div class="request">
            <div  class="request_elem">
            ${req.name}
            </div>
            <div class="request_elem">
            ${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}
            </div>
            <div class="request_elem">${req.requirements}</div>
            <a href="/Requested-Course/${req._id}" style="margin-left:auto;">Get more info...</a>
        </div>
    `;
  });
  requests_container.innerHTML = temp;
};
get_all_requests();
