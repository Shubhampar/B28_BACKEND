const express = require("express")
const {UserModel}=require("../models/user.Model")
const{blacklisted}=require("../models/blacklist.Model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")

const userRouter=express.Router()

userRouter.post("/register", async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists, please login' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new UserModel({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      password: hashedPassword,
      age: req.body.age,
      city: req.body.city,
      is_married: req.body.is_married,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

userRouter.post("/login",async(req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id }, 'masai', { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

userRouter.post("/logout", async(req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the token to the BlacklistedToken collection
    const blacklistedToken = new blacklisted({
      token: req.headers.authorization?.split(" ")[1],
      user: user._id,
    });
    await blacklistedToken.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});



module.exports={
    userRouter
}