const {Router} = require('express');

const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require("mongoose");

const router = Router();

router.post('/user', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    const {email, password, name, isAdmin} = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({error: 'Please add all the fields'});
    }
    const user = new User({
        name,
        email,
        password,
        isAdmin
    });
    user.save().then(result => {
        res.json({user: result});
    }).catch(err => {
        console.log(err);
    })
});

router.put('/user/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    if (!req.body.name || !req.body.email) {
        return res.status(400).json({error: 'Please add all the fields'});
    }
    const user = await User.findById(req.params.id);
    user.name = req.body.name;
    user.email = req.body.email;
    user.isAdmin = req.body.isAdmin;
    user.save().then(result => {
        res.json({user: result});
    }).catch(err => {
        console.log(err);
    })
});

router.delete('/user/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    User.findByIdAndDelete(req.params.id).then(result => {
        res.json({user: result});
    }).catch(err => {
        console.log(err);
    })
});

router.get('/users', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    User.find().then(users => {
        res.json({users});
    }).catch(err => {
        console.log(err);
    })
});

router.get('/user/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid user id'});
    }
    User.findById(req.params.id).then(user => {
        res.json({user});
    }).catch(err => {
        console.log(err);
    })
});

router.post('/post', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    const {title, body, photo} = req.body;
    if (!title || !body) {
        return res.status(400).json({error: 'Please add all the fields'});
    }
    const post = new Post({
        title,
        body,
        photo,
        postedBy: req.user
    });
    post.save().then(result => {
        res.json({post: result});
    }).catch(err => {
        console.log(err);
    })
});

router.put('/post/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    if (!req.body.title || !req.body.body) {
        return res.status(400).json({error: 'Please add all the fields'});
    }
    const post = await Post.findById(req.params.id);
    post.title = req.body.title;
    post.body = req.body.body;
    post.photo = req.body.photo;
    post.save().then(result => {
        res.json({post: result});
    }).catch(err => {
        console.log(err);
    });
});

router.delete('/post/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    Post.findByIdAndDelete(req.params.id).then(result => {
        res.json({post: result});
    }).catch(err => {
        console.log(err);
    })
});

router.get('/posts', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    Post.find().populate('postedBy', '_id name')
        .populate('comments.postedBy', '_id name').then(posts => {
        res.json({posts});
    })
        .catch(err => {
        console.log(err);
    })
});

router.get('/post/:id', async (req, res) => {
    // check if user is admin
    if (!req?.user?.isAdmin) {
        return res.status(405).json({error: 'You are not an admin'});
    }
    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid post id'});
    }
    Post.findById(req.params.id).then(post => {
        res.json({post});
    }).catch(err => {
        console.log(err);
    })
});

module.exports = router;
