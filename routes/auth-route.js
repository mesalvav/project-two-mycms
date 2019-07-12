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

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}
// authRoutes.get("/privatepage", ensureLogin.ensureLoggedIn(), (req, res) => {
//   res.render("privateview/private", { user: req.user });
// });
authRoutes.get('/privatepage', checkRoles('ADMIN'), (req, res) => {
  res.render('privateview/private', {user: req.user});
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