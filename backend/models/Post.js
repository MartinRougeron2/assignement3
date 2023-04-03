// create mongoose blog model

const mongoose = require('mongoose');

const {ObjectId} = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: 'no photo'
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    likes: [{type: ObjectId, ref: 'User'}],
    comments: [{
        text: String,
        postedBy: {type: ObjectId, ref: 'User'}
    }]
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);
