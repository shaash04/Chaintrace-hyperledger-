const express = require('express');
const router = express.Router();
const fabricService = require('../fabricService');

/**
 * GET /api/blockchain/transactions
 * Retrieve all real blockchain transactions from Hyperledger Fabric ledger
 */
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await fabricService.getAllTransactions();
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error in GET /api/blockchain/transactions:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve blockchain transactions'
        });
    }
});

/**
 * GET /api/blockchain/status
 * Check live connectivity to Hyperledger Fabric test network
 */
router.get('/status', async (req, res) => {
    try {
        const status = await fabricService.getNetworkStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: error.message || 'Fabric network unreachable'
        });
    }
});

module.exports = router;
