const express = require('express');
const userRouter = express.Router();
const { getUserByUsername, createUser } = require("../db/users.js");
const {requireUser} = require("./utils")
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
// POST /api/users/login
userRouter.post("/login", async (req, res, next) => {
    const {username, password} = req.body;
  
   
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password",
      });
    }
  
    try {
      const user = await getUserByUsername(username);
      
      if (user && user.password == password) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        const recoveredData = jwt.verify(token, JWT_SECRET);
        res.send({ user, message: "you're logged in!", token });
        return recoveredData;
        
        // create token & return to user
      } else {
        next({
          name: "IncorrectCredentialsError",
          message: "Username or password is incorrect",
        });
      } return user 
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
// POST /api/users/register
userRouter.post("/register", async (req, res, next) => {
 
    const { username, password } = req.body;
  
    try {
      if (password.length < 8) {
        next({
          name: "Password Short",
          message: "Password Too Short!",
          error: "error"
          
        });}


      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: "UserExistsError",
          message: `User ${username} is already taken.`,
          error: "error"
          
        });
      } else {
  
      const user = await createUser({
        username,
        password,
      });
    


      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
    
   
      res.send({
        message: "thank you for signing up",
        token,
        user
      });
    }
    } catch ({ name, message, error }) {
      next({ name, message, error });
    }
  });
// GET /api/users/me
userRouter.get("/me", requireUser, async (req, res, next) => {
    try {
      if (req.user) {
        res.send(req.user);
      } else {
        next({
          name: "IncorrectCredentialsError",
          message: "No me data associated with this token",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
// GET /api/users/:username/routines

module.exports = userRouter;
