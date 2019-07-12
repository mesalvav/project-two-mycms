const express = require("express");
const editorRoutes = express.Router();

// User model
// const User = require("../models/User");

// Bcrypt to encrypt passwords
// const bcrypt = require("bcrypt");
// const bcryptSalt = 10;
//
// const passport = require("passport");
//
// const ensureLogin = require("connect-ensure-login");

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

editorRoutes.get('/uploadDocuments', checkRole('EDITOR'), (req, res) => {
  res.render('editorview/uploadDocuments', {user: req.user});
});

module.exports = editorRoutes;