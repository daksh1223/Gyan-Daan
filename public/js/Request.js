const get_request = async ()=>{
    let data= await axios.get(`/api/get_req_data/${req_id}`);
    console.log(data.data);
    data=data.data;
    let request_container=document.getElementById('request_container');
    let date = new Date(data.RequestedAt);
    request_container.innerHTML=`
         <div class="req_elem">
        Course Requested: ${data.name}
        </div>
        <div class="req_elem">
        Request Date: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}
        </div>
        <div class="req_elem">
        Course Requirements: ${data.requirements}
        </div>    
    `;
}   
get_request();