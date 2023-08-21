const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const auth = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, 'masai')
            if (decoded) {
                req.body.ownerID = decoded.ownerID
                next();
            }
        } catch (err) {
            res.json({msg:"not authorized"})
        }
    } else {
        res.json({msg:'please login'})
    }
}

module.exports = {
    auth
}