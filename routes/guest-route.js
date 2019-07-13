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
const Folio = require('../models/Folio.js');

guestRoutes.get("/listofdocuments", ensureLogin.ensureLoggedIn(), (req, res) => {
  Folio.find()
  .then( arrayFolios => {
    
    res.render("guestview/listofdocuments", { user: req.user , allFolios: arrayFolios });

  })
  .catch(err=>{
    console.log("MI ERROR: " + err);
  });


});

module.exports = guestRoutes;