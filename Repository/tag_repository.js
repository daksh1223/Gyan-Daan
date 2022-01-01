const Tags = require("../Schemas/TagSchema");
const create_new_tag =async(name) => {
    return await Tags.create({name:name});
};
const get_tag_by_name =async(name) => {
    return await Tags.findOne({name:name});
}
exports.create_new_tag = create_new_tag;
exports.get_tag_by_name= get_tag_by_name;