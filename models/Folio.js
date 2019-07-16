const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const folioSchema = new Schema({
  foliotitle: String,
  foliodescription: String,
  foliocreatedby: { type : Schema.Types.ObjectId, ref: 'User' } ,
  folioname: String,
  foliopath: String
  
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

folioSchema.index({
  foliotitle: 'text',
  foliodescription: 'text'
},{ weights: {
      foliotitle: 3,
      foliodescription:1,
},
});

const Folio = mongoose.model("Folio", folioSchema);

module.exports = Folio;