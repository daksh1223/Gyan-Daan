const Tags = require("../Schemas/TagSchema");
const create_new_tag =async(name) => {
    return await Tags.create({ name: name.toLowerCase() });
};
const get_tag_by_name =async(name) => {
    return await Tags.findOne({ name: name.toLowerCase() });
}
const get_all_tags = async () => {

    return await Tags.find();
}
exports.create_new_tag = create_new_tag;
exports.get_tag_by_name = get_tag_by_name;
exports.get_all_tags = get_all_tags;