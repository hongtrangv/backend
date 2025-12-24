
const express = require('express');
const router = express.Router();
const metadataService = require('../services/metadataService');
const { apiOk, apiError } = require('../utils/apiResponse');

router.get('/:documentName', async (req, res) => {
    try {
        const { documentName } = req.params;
        const version = await metadataService.getVersion(documentName);
        if (version !== null) {
            apiOk(res, { documentName, version });
        } else {
            apiError(res, `Metadata for '${documentName}' not found.`, 404);
        }
    } catch (error) {
        apiError(res, error.message);
    }
});

router.put('/:documentName', async (req, res) => {
    try {
        const { documentName } = req.params;
        const { version } = req.body;
        if (!version) {
            return apiError(res, "Version is required in the request body.");
        }
        await metadataService.updateVersion(documentName, version);
        apiOk(res, { documentName, version });
    } catch (error) {
        apiError(res, error.message);
    }
});

module.exports = router;
