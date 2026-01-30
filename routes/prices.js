const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');
const productService = require('../services/productService');
const supplierService = require('../services/supplierService');
const { validatePrice } = require('../validators/priceValidator');
const { apiOk, apiError } = require('../utils/apiResponse');

router.post('/', validatePrice, async (req, res) => {
  try {
    const newPrice = await priceService.insertPrice(req.body);
    apiOk(res, newPrice);
  } catch (error) {
    res.status(500).json({ message: 'Error inserting price', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const prices = await priceService.getPrices();
    apiOk(res, prices);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving prices', error });
  }
});

router.get('/compare/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const prices = await priceService.comparePrices(productName);
    apiOk(res, prices);       
  } catch (error) {
    res.status(500).json({ message: 'Error comparing prices', error });
  }
});

router.get('/products',async (req, res) => {
    try{
        const products = await productService.getProducts();
        apiOk(res, products);        
    } catch(error){
      apiError(res, error.message, 500);
    }
});
/*
Lấy thông tin nhà cung cấp
*/
router.get('/suppliers',async (req, res) => {
    try{
        const suppliers = await supplierService.getSuppliers();
        apiOk(res, suppliers); 
    } catch(error){
        apiError(res, error.message, 500);        
    }
});
module.exports = router;
