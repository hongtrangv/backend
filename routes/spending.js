const express = require('express');
const router = express.Router();
const spendingService = require('../services/spendingService');
const ApiResponse = require('../utils/apiResponse');

// Get spendings
router.get('/', async (req, res) => {
  const apiResponse = new ApiResponse(res);
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const type = req.query.type;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit || req.query.pagesize, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const spendings = await spendingService.getSpending(year, month, type);

    const paginatedSpendings = spendings.slice(startIndex, endIndex);
    const totalPages = Math.ceil(spendings.length / limit);

    return apiResponse.success({
        totalPages,
        currentPage: page,
        totalItems: spendings.length,
        spendings: paginatedSpendings,
    });
  } catch (err) {
    console.error(err);
    return apiResponse.error('Internal Server Error', 500);
  }
});

module.exports = router;