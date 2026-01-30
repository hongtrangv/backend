const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');
const productService = require('../services/productService');
const { validatePrice } = require('../validators/priceValidator');

router.post('/', validatePrice, async (req, res) => {
  try {
    const newPrice = await priceService.insertPrice(req.body);
    res.status(201).json(newPrice);
  } catch (error) {
    res.status(500).json({ message: 'Error inserting price', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const prices = await priceService.getPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving prices', error });
  }
});

router.get('/compare/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const prices = await priceService.comparePrices(productName);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error comparing prices', error });
  }
});

router.get('/product',async (req, res) => {
    try{
        const products = await productService.getProducs();
        res.json(products);
    } catch(error){
        res.status(500).json({ message: 'Error retrieving product', error });
    }
}
);

module.exports = router;
