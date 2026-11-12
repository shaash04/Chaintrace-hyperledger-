const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const productRoutes = require('./routes/productRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fabricService = require('./fabricService');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const status = await fabricService.getNetworkStatus();
    res.json({
        service: 'ChainTrace Backend API',
        version: '1.0.0',
        fabric: status
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        application: 'ChainTrace - Supply Chain Hyperledger Fabric Management',
        endpoints: {
            products: '/api/products',
            blockchain: '/api/blockchain/transactions',
            networkStatus: '/api/blockchain/status',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

const server = app.listen(config.PORT, () => {
    console.log(`====================================================`);
    console.log(` ChainTrace Backend Server Running on Port ${config.PORT}`);
    console.log(` Connected Channel : ${config.CHANNEL_NAME}`);
    console.log(` Target Chaincode  : ${config.CHAINCODE_NAME}`);
    console.log(` Peer Endpoint     : ${config.PEER_ENDPOINT_ORG1}`);
    console.log(`====================================================`);
});

// Clean shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server and closing Fabric gateways...');
    fabricService.close();
    server.close(() => process.exit(0));
});

module.exports = app;
