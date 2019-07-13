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

const Folio = mongoose.model("Folio", folioSchema);

module.exports = Folio;