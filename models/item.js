const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true, unique: true },
  price: { type: Number, required: true  }
});


module.exports = mongoose.model("items", itemSchema);