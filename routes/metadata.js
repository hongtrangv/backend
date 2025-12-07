
const express = require('express');
const router = express.Router();
const metadataService = require('../services/metadataService');
const ApiResponse = require('../utils/apiResponse');

router.get('/:documentName', async (req, res) => {
    const response = new ApiResponse(res);
    try {
        const { documentName } = req.params;
        const version = await metadataService.getVersion(documentName);
        if (version !== null) {
            response.success({ documentName, version });
        } else {
            response.notFound(`Metadata for '${documentName}' not found.`);
        }
    } catch (error) {
        response.error(error.message);
    }
});

module.exports = router;
