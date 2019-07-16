const express = require("express");
const editorRoutes = express.Router();

const Folio  = require("../models/Folio.js");
const uploadCloud = require('../config/cloudinary-setup.js');
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

// checkRole('EDITOR')
editorRoutes.post('/uploadDocument', uploadCloud.single('thefiletoupload') , (req, res, next) => {

  console.log('line 32 post upload: ' + JSON.stringify( req.body));
  console.log('line 33 post upload: ' + JSON.stringify( req.file.url));
  const { foliotitle,
          foliodescription
        } = req.body;

  const foliopath = req.file.url;
  const folioname = req.file.originalname;
  const foliocreatedby = req.user._id;
  
  const newFolio = Folio({  foliotitle: foliotitle,
                            foliodescription: foliodescription,
                            foliocreatedby: foliocreatedby,
                            folioname: folioname,
                            foliopath: foliopath
                          });
  newFolio.save()
  .then( foliox => {
    res.redirect('/listofdocuments');
  })
  .catch(err=>{
    console.log('my ERRor: ' + err);
  })     
  // res.render('guestview/listofdocuments', {user: req.user});
});

editorRoutes.get("/editfolio/:folioid", checkRole('EDITOR'), (req, res) => {
  Folio.findById(req.params.folioid)
  .then(foliox=>{
    res.render("editorview/editfolio",{foliox: foliox});
  })
  .catch(err=>{
    console.log("err in edit folio/:folioid" + err);
  });
});

editorRoutes.post("/editfolio/:folioid", uploadCloud.single('thefiletoupload'), (req, res) => {
  const folioid = req.params.folioid;
  const { foliotitle,
    foliodescription
  } = req.body;

  const foliopath = req.file.url;
  const folioname = req.file.originalname;
  const foliocreatedby = req.user._id;

  Folio.update({_id: req.params.folioid}, {$set: {
      foliotitle: foliotitle,
      foliodescription: foliodescription,
      foliocreatedby: foliocreatedby,
      folioname: folioname,
      foliopath: foliopath
    
  }})
  .then((foliox)=>{
    res.redirect("/viewfolio/" + folioid + "/1");
    
  })
  .catch(err=>{
    console.log("err in editfolio / :folioid " + err);
  });
});

module.exports = editorRoutes;