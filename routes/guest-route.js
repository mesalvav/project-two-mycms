const express = require("express");
const guestRoutes = express.Router();

// User model
// const User = require("../models/User");

// Bcrypt to encrypt passwords
// const bcrypt = require("bcrypt");
// const bcryptSalt = 10;
//
// const passport = require("passport");
//
const ensureLogin = require("connect-ensure-login");


guestRoutes.get("/listofdocuments", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("guestview/listofdocuments", { user: req.user });
});

module.exports = guestRoutes;