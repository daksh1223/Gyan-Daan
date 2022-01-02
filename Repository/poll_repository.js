const Poll = require('../Schemas/PollSchema')
const Option = require('../Schemas/OptionSchema')
const {find_channel_by_id} = require('./channel_repository')
const create_new_option = async (name) => {
    return await Option.create({ name });
}

const check_user_vote = async (id, user) => {
    let option = await Option.findById(id);
    return option.likes.includes(user._id);
}

const toggle_like = async (id, user, vote) => {
    let option = await Option.findById(id);
    if (!vote) {
        option.likes.remove({ _id: user._id })
        option.likeCount -= 1;
    }
    else {
        option.likes.push(user._id)
        option.likeCount += 1;
    }
    option.save()
}

const create_new_poll = async (name, options, type, channel_id) => {
    let poll = await Poll.create({ name, options, type });
    const channel = await find_channel_by_id(channel_id)
    channel.polls.push(poll._id);
    channel.save()
    poll = Poll.findById(poll._id).populate('options')
    return poll;
}

const find_poll_by_id = async (id) => {
    return await Poll.findById(id).populate('options')
}

const update_vote = async (id, options, user) => {
    const poll = await Poll.findById(id);
    for (let i = 0; i < poll.options.length; i++)
    {
        if (await check_user_vote(poll.options[i], user))
        {
            await toggle_like(poll.options[i], user, false);
        }    
    }
    for (let i = 0; i < options.length; i++)
    {
        if (options[i])
        {
            await toggle_like(poll.options[i], user, true);
        }    
    }
    return await Poll.findById(id).populate('options')
}

module.exports = {
    create_new_option,
    update_vote,
    create_new_poll,
    find_poll_by_id
}