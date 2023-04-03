const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {Router} = require('express');


const router = Router();


const User = require('../models/User');

// register route
router.post('/register', async (req, res) => {
    console.log(req.body);
    if (req.body.password.length < 6) {
        return res.status(400).json({error: 'Password must be at least 6 characters'});
    }
    const password =
    User.findOne({email: req.body.email}).then(user => {
        if (user) {
            return res.status(400).json({error: 'User already exists'});
        }
        const new_user = new User({
            name: req.body.name,
            email: req.body.email,
            password: password
        });
        new_user.save().then(user => {
            jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600}, (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        is_admin: user.isAdmin
                    }
                });
            });
        }).catch(err => {
            console.log(err);
        })
    });
});

// login route
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email: email});
    if (!user) {
        return res.status(402).json({error: 'User does not exist'});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({error: 'Invalid credentials'});
    }

    jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: 3600}, (err, token) => {
        if (err) throw err;
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                is_admin: user.isAdmin
            }
        });
    });
});

module.exports = router;
