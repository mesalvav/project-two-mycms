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

var nodemailer = require('nodemailer');

guestRoutes.get("/listofdocuments", ensureLogin.ensureLoggedIn(), (req, res) => {
  Folio.find()
  .then( arrayFolios => {
    
    res.render("guestview/listofdocuments", { user: req.user , allFolios: arrayFolios });

  })
  .catch(err=>{
    console.log("MI ERROR: " + err);
  });


});

guestRoutes.get("/viewfolio/:folioid/:viewedpage", ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log("viewed page: " + req.params.viewedpage);

  Folio.findById(req.params.folioid)
  .then( foliox=>{
    
    res.render("guestview/foliodetail", {foliox:foliox, pagetoview: req.params.viewedpage});
  })
  .catch(err=>{
    console.log("errores from /viewfolio/:folioid  "+err);
  });
});

guestRoutes.get("/emailform/:folioid", ensureLogin.ensureLoggedIn(), (req, res) => {
  
  Folio.findById(req.params.folioid)
  .then( foliox=>{
    let subject = "In regards to Folio: " + foliox.foliotitle;
    let clickthis = "To see Folio click this link: ";
    let urllink = foliox.foliopath;
    let emailx = {subject: subject, clickthis: clickthis, urllink: urllink};

    res.render("guestview/emailform", {emailx: emailx});
  })
  .catch(err=>{
    console.log("errores from GET /emailform/:folioid  "+ err);
  });
});


guestRoutes.post("/sendfoliobyemail", ensureLogin.ensureLoggedIn(), (req, res) => {
  let { email, subject, message } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAILUSER,
      pass: process.env.GMAILPASSWORD
    }
  });

  transporter.sendMail({
    from: '"My Awesome Project 👻" <myawesome@project.com>',
    to: email, 
    subject: subject, 
    text: message,
    html: `<b>${message}</b>`
  })
  .then(info => {

    console.log( 'email: ' + email +  'subject: ' + subject);
    res.redirect('/listofdocuments');
  })
  .catch(error => console.log("error from POST  sendfoliobyemail  " + error));
})

guestRoutes.post("/commentthispage", ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log(" from  commentthispage " + JSON.stringify( req.body));
  // res.redirect("/listofdocuments");
    res.redirect("/viewfolio/"+ req.body.folioid +"/" + req.body.pagenumber);
 })

module.exports = guestRoutes;