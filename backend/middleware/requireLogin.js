// middleware authentication jwt

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireLogin = async (req, res, next) => {
    const {authorization} = req.headers;
    if (!authorization) {
        req.user = null;
        next();
        return;
    }
    const token = authorization.replace('Bearer ', '');
    let payload = null
    try {
        payload = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        payload = null;
        console.log(err);
    }
    console.log(payload);
    if (!payload) {
        req.user = null;
        next();
        return;
    }
    const user = await User.findById(payload.id);
    console.log(user)
    if (!user) {
        req.user = null;
        next();
        return;
    }
    req.user = user;
    next();
}

module.exports = requireLogin;
