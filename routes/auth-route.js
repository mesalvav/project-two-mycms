// routes/auth-routes.js
const express = require("express");
const authRoutes = express.Router();

// User model
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
//
const passport = require("passport");
//
const ensureLogin = require("connect-ensure-login");

authRoutes.get("/signup", (req, res, next) => {
  res.render("authview/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("authview/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("authview/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("authview/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });

  })
  .catch(error => {
    next(error)
  })
});

// log in ...
authRoutes.get("/login", (req, res, next) => {
  res.render("authview/login");
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

function checkRole(role) {
  return function(req, res, next) {
    // let permission = (req.user.role === role);
    if (req.isAuthenticated() && (req.user.role === role || req.user.role === 'ADMIN')) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}



authRoutes.get('/adminlistofusers', checkRole('ADMIN'), (req, res) => {
  User.find()
  .then((arrayUsers)=>{

    res.render('adminview/listofusers', {user: req.user, allUsers: arrayUsers});
  })
  .catch((err)=>{
      console.log("mi ERROR: " + err);
  })

});



authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

authRoutes.get("/logout", (req, res, next) => {
  
  req.logout();
    
      res.redirect("/login"); 
  });

module.exports = authRoutes;