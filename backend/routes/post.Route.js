const express = require("express");
const {PostModel } = require("../models/post.Model");
const {UserModel}=require("../models/user.Model")
const { auth } = require("../middlewares/auth.middleware");
// const { userRouter } = require("./user.Route");



const postRouter = express.Router();

postRouter.post("/add",auth, async (req,res) => {
  try {
    const user = await user.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = new PostModel({
      title: req.body.title,
      body: req.body.body,
      device: req.body.device,
      no_of_comments: req.body.no_of_comments,
      user: user._id,
    });
    await post.save();

    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

postRouter.get("/",auth, async (req, res) => {
  try {
    const user = await user.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await PostModel.find({ user: user._id })
      .limit(3) // Limit to 3 posts per page
      .skip((req.query.page - 1) * 3) // Pagination
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

postRouter.get('/top',auth, async (req, res) => {
  try {
    const user = await user.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const topPosts = await PostModel.find({ user: user._id })
      .sort({ no_of_comments: -1 })
      .limit(3) // Limit to 3 top posts per page
      .skip((req.query.page - 1) * 3) // Pagination
      .exec();

    res.status(200).json(topPosts);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
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
