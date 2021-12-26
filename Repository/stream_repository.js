const Streams = require("../Schemas/StreamSchema");

const create_new_stream = () => {
  return new Streams();
};

// Will find all the streams having the required userid and will return the last element among them.
const find_stream_by_userid = async (id) => {
  var response= await Streams.find({ userid: id });
  return response[response.length-1]; 
};
exports.create_new_channel = create_new_stream;
exports.find_stream_by_userid = find_stream_by_userid;
