const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const commentSchema = new Schema({
  pagenumber: String,
  commentcontent: String,
  commentcreatedby: { type : Schema.Types.ObjectId, ref: 'User' } ,
  commenteddocument: { type: Schema.Types.ObjectId, ref:'Folio'}
  
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Folio = mongoose.model("Folio", folioSchema);

module.exports = Folio;