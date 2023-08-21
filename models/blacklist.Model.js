const mongoose = require("mongoose");

const blacklistSchema = mongoose.Schema({
  token: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
    
})

const BlacklistModel = mongoose.model("blacklist", blacklistSchema);
module.exports = {
    BlacklistModel
}