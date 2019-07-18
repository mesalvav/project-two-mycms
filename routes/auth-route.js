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
        res.redirect("/listofdocuments");
      }
    });

  })
  .catch(error => {
    next(error)
  })
});

// log in ...
authRoutes.get("/login", (req, res, next) => {
  res.render("authview/login",  { "message": req.flash("error")});
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/listofdocuments",
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
      res.redirect('/login');
    }
  }
}



authRoutes.get('/adminlistofusers', checkRole('ADMIN'), (req, res) => { 
  // const mysalt = bcrypt.genSaltSync(bcryptSalt);
  // hashPassSuper = bcrypt.hashSync('yosoysuper', mysalt);


  User.find()
  .then((arrayUsers)=>{
    
    arrayUsers.forEach(userx=>{
      if (userx.role === 'ADMIN') {
        console.log("locale compare password " + 'superadmin'.localeCompare(userx.username) === 0);
        if ('superadmin'.localeCompare(userx.username) === 0) {
          userx.roleSuper = true;
        }
        
        userx.roleAdmin = true;
      } else if (userx.role === 'EDITOR'){
        userx.roleEditor = true;
      }
       else {
         userx.roleGuest = true;
       }
    });

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


  authRoutes.post('/updaterole/:userid', checkRole('ADMIN'), (req, res) => { 
   // User.findByIdAndUpdate()
   console.log("from POST update req.body " + JSON.stringify(req.body));

    User.update({_id: req.params.userid}, {$set:{
      role: req.body.role
    }})
    .then( (userx)=>{

      res.redirect("/adminlistofusers");
    })
    .catch( (err)=>{
      console.log("from POST err is: " + err);
    })

  });


  authRoutes.post("/deleteuser/:userid", ensureLogin.ensureLoggedIn(), (req, res) => {
    const userid = req.params.userid;
   
    
    console.log(">>>>>>>>>> =======  ==== > from delete user " + userid);
  
    User.findByIdAndRemove(userid)
    .then (()=>{
      console.log("remove removed User ====++++");
      res.redirect("/adminlistofusers");
    })
    .catch(err=>{
      console.log("err from delete User " + err);
    });
  });

module.exports = authRoutes;