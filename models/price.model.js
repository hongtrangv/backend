const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  promotionDate: { type: Date, required: true },
  quotingUnit: { type: String, required: true },
  supplier: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Price', priceSchema);