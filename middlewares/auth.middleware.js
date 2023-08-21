const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const auth = (req,res,next) => {
  try {
      const token = req.headers.authorization?.split(" ")[1];
      // const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, 'masai');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).send({ error: 'Authentication failed' });
    }
}

module.exports = {
    auth
}