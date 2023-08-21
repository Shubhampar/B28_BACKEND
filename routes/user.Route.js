const express = require("express")
const {UserModel}=require("../models/user.Model")
const{blacklisted}=require("../models/blacklist.Model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")

const userRouter=express.Router()

userRouter.post("/register", async (req, res) => {
const { username, email, pass } = req.body;
  try {
    bcrypt.hash(pass, 5, async (err, hash) => {
      if (err) {
        res.status(400).json({ msg: "something went wrong", error: err.msg });
      } else {
        const user = new UserModel({ username, email, pass: hash});
        await user.save();
        res.status(200).json({ msg: "The new user has been registered"});
      }
    });
  } catch (err) {
      res.status(400).json({"error":err.msg})
  }
});

userRouter.post("/login",async(req, res) => {
    const { email, pass } = req.body;
try {
      const user = await UserModel.findOne({ email })
      if (user) {
          bcrypt.compare(pass, user.pass,  (err, result)=> {
              if (result) {
                  const token = jwt.sign({userID:user._id,user:user.username}, "book",{
                    expiresIn: "7d",
                  })
                  res.status(200).json({msg:"Login successfull!!",token})   
              } else {
                  res.status(400).json({ err:err});
            }      
          });
      } else {
          res.status(400).json({ msg: "User does not exist!!" });
      }
  } catch (err) {
      res.status(400).json({ error: err});
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