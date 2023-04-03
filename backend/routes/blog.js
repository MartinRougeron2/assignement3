const {Router} = require('express');

const Post = require('../models/Post');
const mongoose = require("mongoose");

const router = Router();

// create post route
router.post('/create', (req, res) => {
    const {title, body} = req.body;
    const photo = req.body.photo || '';
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
        console.log(result);
        res.status(201).json({post: result});
    }).catch(err => {
        console.log(err);
    })
});

// comment post route
router.post('/comment/:id', (req, res) => {
    console.log("comment route");
    const comment = {
        text: req.body.text,
        postedBy: req.user
    };
    Post.findByIdAndUpdate(req.params.id, {
        $push: {comments: comment}
    }, {new: true})
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .then((err, result) => {
            if (err) {
                return res.status(200).json({error: err});
            }
            res.json(result);
        })
});

// edit comment route
router.put('/comment/:id', (req, res) => {
    console.log("edit comment route");
    Post.findByIdAndUpdate(req.params.id, {
        $pull: {comments: {_id: req.body.commentId}}
    }, {new: true})
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .then((err, result) => {
            if (err) {
                return res.status(400).json({error: err});
            }
            res.json(result);
        });
});

// delete comment route
router.delete('/comment/:id', async (req, res) => {
    console.log("delete comment route");
    const post = await Post.findById(req.params.id);
    console.log(req.body)
    post.comments = post.comments.filter(comment => comment._id.toString() !== req.body.commentId);
    post.save().then(result => {
        res.json(result);
    });
});

// get all posts route
router.get('/all', (req, res) => {
    Post.find()
        .populate('postedBy', '_id name')
        .populate('comments.postedBy', '_id name')
        .then(posts => {
            res.json(posts);
        }).catch(err => {
        console.log(err);
    })
});

// get single post route
router.get('/:id', (req, res) => {
    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({error: 'Invalid post id'});
    }
    Post.findById(req.params.id)
        .populate('postedBy', '_id name')
        .populate('comments.postedBy', '_id name')
        .then(post => {
            res.json({post});
        }).catch(err => {
        console.log(err);
    })
});

// update post route
router.put('/:id', (req, res) => {
    if (!req.body.title || !req.body.body) {
        return res.status(400).json({error: 'Please add all the fields'});
    }
    const post = Post.findById(req.params.id);
    if (post.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({error: 'You are not authorized to update this post'});
    }
    Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            body: req.body.body,
            photo: req.body.photo
        }
    }, {new: true}).then(result => {
        res.json(result);
    });
});

// delete post route
router.delete('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    console.log(post)
    if (post.postedBy == null) {
        Post.findByIdAndDelete(req.params.id).then(result => {
        res.json(result);
        }).catch(err => {
            console.log(err);
        });
        return;
    }
    if (req.user.isAdmin === true) {
        Post.findByIdAndDelete(req.params.id).then(result => {
            res.json(result);
        }).catch(err => {
            console.log(err);
        });
        return;
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({error: 'You are not authorized to delete this post'});
    }
    Post.findByIdAndDelete(req.params.id).then(result => {
        res.json(result);
    }).catch(err => {
        console.log(err);
    })
});

module.exports = router;
