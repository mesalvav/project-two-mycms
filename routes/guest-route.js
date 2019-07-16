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
const Comment = require('../models/Comment.js')
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

guestRoutes.post("/listofdocumentswithsearch", ensureLogin.ensureLoggedIn(), (req, res) => {

  console.log("from /listofdocumentswithsearch " + req.body.termtosearch);
  const term = req.body.termtosearch;
  Folio.find({$text: {$search: term}})
  .then( arrayFolios => {
    

    res.render("guestview/listofdocuments", { user: req.user , allFolios: arrayFolios });

  })
  .catch(err=>{
    console.log("MI ERROR: " + err);
  });

});

guestRoutes.get("/viewfolio/:folioid/:viewedpage", ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log("viewed page: " + req.params.viewedpage);
 const isNotEditor = req.user.role !== 'EDITOR';

  Folio.findById(req.params.folioid)
  .then( foliox=>{
    
    res.render("guestview/foliodetail", {foliox:foliox, 
                                          pagetoview: req.params.viewedpage,
                                          isNotEditor: isNotEditor});
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
    const  commentcontent = req.body.commentcontent;
    const commenteddocument = req.body.folioid;
    const pagenumber = req.body.pagenumber;
    const commentcreatedby = req.user._id;


    const newComment= Comment({pagenumber: pagenumber,
                              commentcontent:commentcontent,
                              commentcreatedby: commentcreatedby,
                              commenteddocument: commenteddocument
                            })
    
    newComment.save()
    .then( commentx=> {
      res.redirect("/viewfolio/"+ req.body.folioid +"/" + req.body.pagenumber);

    })
    .catch(err=>{
      console.err("my comment err: " + err);
    })
 })

 guestRoutes.get("/allcommentsforfolio/:folioid", ensureLogin.ensureLoggedIn(), (req, res) => {
    
  let isEditor = false;
  if (req.user.role === 'EDITOR' || req.user.role === 'ADMIN') {
    console.log("============>>>>>> +++  is editor: " + req.user.role);
    isEditor = true;
  }
    Comment.find().populate(['commenteddocument','commentcreatedby'])
    .then((allComments)=>{
      if (isEditor > 0) {
        const filteredComments = allComments.filter( (eachComment)=>{ 
          const isUserAndFolio = eachComment.commenteddocument._id.equals(req.params.folioid);                      
          return isUserAndFolio;
        });
          console.log("more than 1 " + filteredComments.length);

        if (filteredComments.length > 0){
          res.render("editorview/allcommentsforfolioEditorVersion", 
          {  filteredComments: filteredComments,
            foliox: filteredComments[0].commenteddocument
            
            });
        } else {
          res.render("editorview/allcommentsforfolioEditorVersion", 
          {noComments: true, folioid: req.params.folioid}
          );
        }
        
      } else {

          const filteredComments = allComments.filter( (eachComment)=>{ 
            const isUserAndFolio = eachComment.commenteddocument._id.equals(req.params.folioid)
                                    && eachComment.commentcreatedby.equals(req.user._id);
            return isUserAndFolio;
          });
            console.log("more than 1 " + filteredComments.length);

          if (filteredComments.length > 0){
            
            // console.log("filtered comments: " + filteredComments);
            res.render("guestview/allcommentsforfolio", 
                          {  filteredComments: filteredComments,
                            foliox: filteredComments[0].commenteddocument
                             
                            });
          } else {
            res.render("guestview/allcommentsforfolio", {noComments: true, folioid: req.params.folioid});
          }
        
      }


       
    })
    .catch(err=>{
      console.log("err from allcommentsforfolio " + err);
    });

});

guestRoutes.get("/editcomment/:commentid", ensureLogin.ensureLoggedIn(), (req, res) => {
  Comment.findById(req.params.commentid).populate('commenteddocument')
  .then(commentx=>{
    res.render("guestview/editcomment",{commentx: commentx});
  })
  .catch(err=>{
    console.log("err in editcomment " + err);
  });
});

guestRoutes.post("/editcomment/:commentid/:folioid", ensureLogin.ensureLoggedIn(), (req, res) => {
  const folioid = req.params.folioid;
  const commentcontent = req.body.commentcontent;
  Comment.update({_id: req.params.commentid}, {$set: {commentcontent}})
  .then(commentx=>{
    res.redirect("/allcommentsforfolio/" + folioid);
    // res.render("guestview/editcomment",{commentx: commentx});
  })
  .catch(err=>{
    console.log("err in editcomment " + err);
  });
});

guestRoutes.post("/deletecomment/:commentid/:folioid", ensureLogin.ensureLoggedIn(), (req, res) => {
  const folioid = req.params.folioid;
  const commentid = req.params.commentid;
  
  console.log(">>>>>>>>>> =======  ==== > from delete comment " + commentid);

  Comment.findByIdAndRemove(commentid)
  .then (()=>{
    console.log("remove removed ====++++");
    res.redirect("/allcommentsforfolio/" + folioid);
  })
  .catch(err=>{
    console.log("err from delete comment " + err);
  });
});


module.exports = guestRoutes;