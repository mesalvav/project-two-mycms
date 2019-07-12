const mongoose = require('mongoose');
const User = require('../models/User');

// node bin/seed.js
mongoose
  .connect('mongodb://localhost/mycms', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });



// node bin/seed.js
User.create({username:"nombre", password:"laclave"})
  .then(()=>{
      console.log("yey it worked..");
      mongoose.connection.close();
  })
  .catch((err)=>{
    console.log("error en base semilla");
  });