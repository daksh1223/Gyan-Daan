async function getLoggedUser() {
  let data = await axios.get("/api/user/logged");

  return data.data;
}
let tags, profilepicUrl, idUrl;

const fileUrl = async (id) => {
  let formData = new FormData();
  formData.append("upload", document.getElementById(id).files[0]);
  let data = await axios.post("/api/uploadFile", formData);

  return data.data.path;
};
async function onSubmit() {
  if (
    document.getElementById("file") &&
    document.getElementById("file").files.length > 0
  ) {
    idUrl = await fileUrl("file");
  }
  if (document.getElementById("profile_pic_upload").files.length > 0) {
    profilepicUrl = await fileUrl("profile_pic_upload");
  }

  const about = document.getElementById("about").value;
  const tags = $("#user_tags").tagsinput("items");

  await axios.post("/api/set_user_profile", {
    idUrl,
    about,
    tags,
    profilepicUrl,
  });
  window.location = "/home";
}

function previewProfileImage() {
  let uploader = document.getElementById("profile_pic_upload");
  if (uploader.files && uploader.files[0]) {
    var imageFile = uploader.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      $("#profile_pic").attr("src", e.target.result);
    };
    reader.readAsDataURL(imageFile);
  }
}

const addTagsandProfile = () => {
  let profielurl = profilepicUrl;
  $("#profile_pic").attr("src", `${profielurl}`);
  let tagsString = "";
  for (let i = 0; i < tags.length; i++) {
    tagsString = tagsString + tags[i] + ",";
  }
  $("#user_tags").tagsinput();
  $("#user_tags").tagsinput("add", tagsString);
};

const profileEJS = async () => {
  let data = await axios.get("/api/user/logged");
  const loggedUser = data.data;
  data = await axios.get(`/api/user/${email}`);
  const reqUser = data.data;
  profilepicUrl = reqUser.profilepicUrl;
  idUrl = reqUser.idUrl;
  tags = reqUser.tags;
  let htmlString;

  if (reqUser.email == loggedUser.email) {
    let tagsInputHtml = "";
    let idHtml = "";
    let about = "";
    let verification = "Pending";
    if (loggedUser.isVerified) {
      verification = "Verified";
    }
    if (loggedUser.about) {
      about = loggedUser.about;
    }
    if (loggedUser.isEducator) {
      tagsInputHtml = `<div class="form-group">
							<label>Add topics</label>
							<input type="text" data-role="tagsinput"  id="user_tags" />
							<small class="form-text" style="font-weight: 400">
								Add tags/topics by typing.<br />
								Press enter after typing to add a new tag/topic.
							</small>
						</div>`;

      if (!loggedUser.idUrl) {
        idHtml = `	<div class='form-group' id='filePar'>
						<label for='file' class='control-label'>
							Government Id
						</label>
						<input type='file' class='form-control' id='file' />
						<span class='glyphicon'></span>
						<span class='help-block'></span>
					</div>
					<div class='form-group'>
						<label class='control-label'>Verification - Id not submitted yet!</label>
					</div>
					`;
      } else {
        idHtml = `<div class='form-group'>
					<label class='control-label'>government Id - submitted</label>
				</div>
				<div class='form-group'>
					<label class='control-label'>Verification - ${verification}</label>
				</div>
			`;
      }
    }

    htmlString = `<form class="form-container">
					<div style="display:flex;justify-content:space-around">
						<div style="margin-top: 2%;">
							<img src="#" id='profile_pic' class="avatar"/>
							<button id="edit_profile_pic" type="button" style="background-color: transparent;border: none;" >
								<span  class="material-icons" style="color:rgb(79, 70, 229);">
									edit
								</span>
							</button>
						</div>
						<input type="file" id="profile_pic_upload" style="display:none" accept="image/*" onchange=''>
				    </div>
			
					<div style="display: flex;justify-content:center;color:rgb(79, 70, 229)">
						<h1>${loggedUser.name}</h1>
					</div>
					<div class="form-group" id="emailPar">
						<label for="email" class="control-label">Email Address</label>
						<input
							type="email"
							class="form-control"
							id="email"
							value='${loggedUser.email}'
							readonly
						/>
					
					</div>
					<div class="form-group" id="aboutPar">
						<label for="about" class="control-label">About</label>
						<textarea class="form-control" id="about"placeholder="Enter text"style="max-width: 100%; min-width: 100%">${about}</textarea>
					</div>
						${tagsInputHtml}
						${idHtml}
					<button type="button" onclick="onSubmit()" class="btn" style="background-color:rgb(79, 70, 229);color:white;margin-bottom:5%;" >
						Edit
					</button>
				</form>`;
  } else {
    let verification = "Pending";
    if (reqUser.isVerified) {
      verification = "Verified";
    }
    let tagsHtml = "";
    for (let i = 0; i < tags.length; i++) {
      tagsHtml =
        tagsHtml +
        `<div class="tag label label-info" style="    color: white;
    background-color: #292929;">${tags[i]}</div>`;
    }
    htmlString = `
		<form class="form-container">
			<div style="display:flex;justify-content:space-around;margin-top: 2%;">
				<img src="#" id='profile_pic' class="avatar"/>
			</div>	
			<div style="display: flex;justify-content:space-around;color:rgb(79, 70, 229)">
				<h1>${reqUser.name}</h1>
			</div>
			<div class="form-group" id="emailPar">
				<label for="email" class="control-label">Email Address</label>
				<input
						type="email"
						class="form-control"
						id="email"
						value='${reqUser.email}'
						readonly
					/>			
				</div>
				<div class="form-group" id="aboutPar">
					<label for="about" class="control-label">About</label>
					<textarea class="form-control" id="about"placeholder="Enter text"style="max-width: 100%; min-width: 100%" readonly>${reqUser.about}</textarea>
				</div>
				<p  class="control-label" style="color:white;font-weight: 700;">Topics</p>
				<div class="form-group" >
				<div style="width:100%;display:grid;  row-gap:1rem;column-gap:1rem; grid-template-columns: auto auto auto auto;grid-template-rows: auto auto auto auto;background-color:white;padding:1%;">
					${tagsHtml}
				</div>
			</div>
			<div class='form-group'>
				<label class='control-label'>Verification - ${verification}</label>
			</div>
		</form>
				`;
  }
  document.getElementsByClassName("main-container")[0].innerHTML = htmlString;
  addTagsandProfile();
  $("#profile_pic_upload").change(function () {
    previewProfileImage();
  });
  $("#edit_profile_pic").click(function (e) {
    $("#profile_pic_upload").click();
  });
};
profileEJS();
