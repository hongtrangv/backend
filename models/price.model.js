const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  promotionDate: { type: Date, required: true },  
  supplier: { type: String, required: true },
  notes: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Price', priceSchema);