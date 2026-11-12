const express = require('express');
const router = express.Router();
const fabricService = require('../fabricService');

// Helper to extract role from headers or body
const getRole = (req) => {
    return req.headers['x-user-role'] || req.body.role || req.query.role || 'Manufacturer';
};

/**
 * POST /api/products
 * Register a new product (Manufacturer only)
 */
router.post('/', async (req, res) => {
    try {
        const role = getRole(req);
        const { id, name, description, manufacturer, batchNumber, manufacturingDate, origin } = req.body;

        if (!id || !name || !description || !manufacturer || !batchNumber || !manufacturingDate || !origin) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: id, name, description, manufacturer, batchNumber, manufacturingDate, origin'
            });
        }

        const product = await fabricService.createProduct(role, {
            id,
            name,
            description,
            manufacturer,
            batchNumber,
            manufacturingDate,
            origin
        });

        res.status(201).json({
            success: true,
            message: `Product "${id}" successfully registered on Hyperledger Fabric ledger`,
            data: product
        });
    } catch (error) {
        console.error('Error in POST /api/products:', error.message);
        res.status(error.message.includes('Access Denied') ? 403 : 500).json({
            success: false,
            error: error.message || 'Failed to create product on blockchain'
        });
    }
});

/**
 * GET /api/products
 * Retrieve all products from the ledger
 */
router.get('/', async (req, res) => {
    try {
        const products = await fabricService.getAllProducts();
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error in GET /api/products:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve products from blockchain'
        });
    }
});

/**
 * GET /api/products/:id
 * Retrieve single product details by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await fabricService.readProduct(id);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error(`Error in GET /api/products/${req.params.id}:`, error.message);
        res.status(404).json({
            success: false,
            error: error.message || `Product "${req.params.id}" not found on ledger`
        });
    }
});

/**
 * POST /api/products/:id/transfer
 * Transfer product ownership / stage
 */
router.post('/:id/transfer', async (req, res) => {
    try {
        const { id } = req.params;
        const role = getRole(req);
        const { newOwner, newLocation, newStatus } = req.body;

        if (!newOwner) {
            return res.status(400).json({
                success: false,
                error: 'newOwner is required for transfer operation'
            });
        }

        const updatedProduct = await fabricService.transferProduct(role, id, {
            newOwner,
            newLocation,
            newStatus
        });

        res.json({
            success: true,
            message: `Product "${id}" transferred successfully on Hyperledger Fabric`,
            data: updatedProduct
        });
    } catch (error) {
        console.error(`Error in POST /api/products/${req.params.id}/transfer:`, error.message);
        res.status(error.message.includes('Unauthorized') ? 403 : 500).json({
            success: false,
            error: error.message || 'Product transfer failed on blockchain'
        });
    }
});

/**
 * PUT /api/products/:id/location
 * Update physical location of product
 */
router.put('/:id/location', async (req, res) => {
    try {
        const { id } = req.params;
        const role = getRole(req);
        const { location } = req.body;

        if (!location) {
            return res.status(400).json({
                success: false,
                error: 'location is required'
            });
        }

        const updatedProduct = await fabricService.updateLocation(role, id, location);

        res.json({
            success: true,
            message: `Product "${id}" location updated successfully`,
            data: updatedProduct
        });
    } catch (error) {
        console.error(`Error in PUT /api/products/${req.params.id}/location:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update product location on blockchain'
        });
    }
});

/**
 * GET /api/products/:id/history
 * Retrieve full cryptographic blockchain history of a product
 */
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const history = await fabricService.getProductHistory(id);
        res.json({
            success: true,
            productId: id,
            count: history.length,
            data: history
        });
    } catch (error) {
        console.error(`Error in GET /api/products/${req.params.id}/history:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to retrieve product history from blockchain'
        });
    }
});

module.exports = router;
