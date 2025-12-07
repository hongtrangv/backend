
const express = require('express');
const router = express.Router();
const metadataService = require('../services/metadataService');
const { apiResponse } = require('../utils/apiResponse');

router.get('/:documentName', async (req, res) => {
    try {
        const { documentName } = req.params;
        const version = await metadataService.getVersion(documentName);
        if (version !== null) {
            res.status(200).json(apiResponse({ documentName, version }));
        } else {
            res.status(404).json(apiResponse(null, `Metadata for '${documentName}' not found.`));
        }
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

router.put('/:documentName', async (req, res) => {
    try {
        const { documentName } = req.params;        
        await metadataService.updateVersion(documentName);
        res.status(200).json(apiResponse({ documentName, version }));
    } catch (error) {
        res.status(500).json(apiResponse(null, error.message));
    }
});

module.exports = router;
