const Chats = require("../Schemas/ChatSchema");

// Will create a new chat with the given name, message, email and time.
const create_new_chat = (username, message, useremail,timestamp,type) => {
    let newchat = new Chats();
    newchat.username = username; 
    newchat.message = message;
    newchat.email = useremail;
    newchat.timestamp = timestamp;
    newchat.type = type;
    newchat.save();
    return newchat;
};
const delete_chat = async (id) => {
  let delChat=await Chats.findById(id);
  delChat.message = "<pre>This message has been deleted</pre>"
  delChat.type = "deleted";
  delChat.timestamp = "";
  await delChat.save();
  return 'success';

}
const edit_chat = async (id, newData, timestamp) => {
	let chat = await Chats.findById(id);
	//console.log(chat)
	chat.message = newData;
	chat.timestamp = timestamp;
	await chat.save();
	//console.log(chat);
	return "success";
};
exports.create_new_chat = create_new_chat;
exports.delete_chat = delete_chat;
exports.edit_chat = edit_chat;
