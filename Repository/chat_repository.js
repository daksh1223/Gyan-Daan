const Chats = require("../Schemas/ChatSchema");

// Will create a new chat with the given name, message, email and time.
const create_new_chat = (username, message, useremail,timestamp) => {
    let newchat = new Chats();
    newchat.username = username; 
    newchat.message = message;
    newchat.email = useremail;
    newchat.timestamp = timestamp;
    newchat.save();
    return newchat;
  };
exports.create_new_chat = create_new_chat;
