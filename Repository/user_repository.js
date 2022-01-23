const Users = require("../Schemas/UserSchema");

const create_new_user = () => {
  return new Users();
};
const find_user_by_id_and_populate_last_notifications = async (id) => {
  return await Users.findById(id).populate("channel_last_notification_id");
}
const find_user_by_email = async (email) => {
  return await Users.findOne({ email: email });
};
const get_all_users = async () => {
  return await Users.find();
};
const get_user_rooms = async (email) => {
  return await Users.findOne({ email: email }) // Will find user by his/her email id and then will return all the rooms corresponding to that user.
    .populate("rooms")
    .select("rooms");
};
const get_user_by_id_and_populate_Rooms = async (id) => {
  let data= await Users.findById(id).populate("rooms");
  return data;
};
exports.create_new_user = create_new_user;
exports.find_user_by_email = find_user_by_email;
exports.get_all_users = get_all_users;
exports.get_user_rooms = get_user_rooms;
exports.get_user_by_id_and_populate_Rooms = get_user_by_id_and_populate_Rooms;
exports.find_user_by_id_and_populate_last_notifications = find_user_by_id_and_populate_last_notifications;