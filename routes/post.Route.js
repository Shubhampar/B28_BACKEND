const express = require("express");
const mongoose=require("mongoose")
const {PostModel } = require("../models/post.Model");
const {UserModel}=require("../models/user.Model")
const { auth } = require("../middlewares/auth.middleware");
// const { userRouter } = require("./user.Route");


const postRouter = express.Router();

postRouter.post("/add",auth, async (req,res) => {
  try {
    const post = new PostModel({
      title: req.body.title,
      body: req.body.body,
      device: req.body.device,
      no_of_comments: req.body.no_of_comments,
      user: req.user._id, // Set the logged-in user's ID
    });

    await post.save();
    res.status(201).send('Post created successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

postRouter.get("/",auth, async (req, res) => {
  try {
    let query = { user: req.user._id };

    // Handle user filter query
    const userIdQuery = req.query.user;
    if (userIdQuery && mongoose.isValidObjectId(userIdQuery)) { // Use mongoose.isValidObjectId
      query.user = userIdQuery;
    }

    // Handle min and max comments filter queries
    if (req.query.min_comments) {
      query.no_of_comments = { $gte: parseInt(req.query.min_comments) };
    }
    if (req.query.max_comments) {
      if (query.no_of_comments) {
        query.no_of_comments.$lte = parseInt(req.query.max_comments);
      } else {
        query.no_of_comments = { $lte: parseInt(req.query.max_comments) };
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = 3;
    const totalPosts = await PostModel.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    const userPosts = await PostModel.find(query)
      .sort('-createdAt')
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.send({
      posts: userPosts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

postRouter.get('/top',auth, async (req, res) => {
  try {
    const query = { user: req.user._id };
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = 3;

    const topPosts = await PostModel.find(query)
      .sort('-no_of_comments')
      .skip((page - 1) * perPage)
      .limit(perPage);
    
    res.send(topPosts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

postRouter.patch("/update/:postId",auth, async (req, res) => {
  try {
    const user = await user.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postId = req.params.postId;
    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: postId, user: user._id },
      { $set: req.body }, // Update fields based on request body
      { new: true } // Return the updated post
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found or user does not own the post' });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

postRouter.delete("/delete/:postId",auth, async (req, res) => {
  try {
    const user = await user.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postId = req.params.postId;
    const deletedPost = await PostModel.findOneAndDelete({ _id: postId, user: user._id });

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found or user does not own the post' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = {
    postRouter
};
