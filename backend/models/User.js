// create mongoose user model

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    expireToken: Date,
    pic: {
        type: String,
        default: 'https://res.cloudinary.co'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);
