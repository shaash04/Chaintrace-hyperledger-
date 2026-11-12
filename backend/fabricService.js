const fs = require('fs');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const config = require('./config');

const utf8Decoder = new TextDecoder();

class FabricService {
    constructor() {
        this.gateways = {};
        this.contracts = {};
        this.clients = {};
    }

    async _createConnection(orgKey) {
        const orgConfig = config[orgKey];
        if (!orgConfig) {
            throw new Error(`Unknown organization key: ${orgKey}`);
        }

        if (!fs.existsSync(orgConfig.tlsCertPath) || !fs.existsSync(orgConfig.certPath) || !fs.existsSync(orgConfig.keyPath)) {
            throw new Error(`Cryptographic material missing for ${orgKey}. Check path: ${orgConfig.tlsCertPath}`);
        }

        const endpoint = orgKey === 'ORG1' ? config.PEER_ENDPOINT_ORG1 : config.PEER_ENDPOINT_ORG2;
        const hostAlias = orgKey === 'ORG1' ? config.PEER_HOST_ALIAS_ORG1 : config.PEER_HOST_ALIAS_ORG2;

        const tlsRootCert = fs.readFileSync(orgConfig.tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        const client = new grpc.Client(endpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': hostAlias,
        });

        const credentials = fs.readFileSync(orgConfig.certPath);
        const identity = { mspId: orgConfig.mspId, credentials };

        const privateKeyPem = fs.readFileSync(orgConfig.keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        const signer = signers.newPrivateKeySigner(privateKey);

        const gateway = connect({
            client,
            identity,
            signer,
            evaluateOptions: () => ({ deadline: Date.now() + 10000 }),
            endorseOptions: () => ({ deadline: Date.now() + 20000 }),
            submitOptions: () => ({ deadline: Date.now() + 20000 }),
            commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
        });

        const network = gateway.getNetwork(config.CHANNEL_NAME);
        const contract = network.getContract(config.CHAINCODE_NAME);

        this.clients[orgKey] = client;
        this.gateways[orgKey] = gateway;
        this.contracts[orgKey] = contract;

        return contract;
    }

    async getContract(role = 'Manufacturer') {
        const orgKey = (role === 'Retailer') ? 'ORG2' : 'ORG1';
        if (!this.contracts[orgKey]) {
            await this._createConnection(orgKey);
        }
        return this.contracts[orgKey];
    }

    /**
     * Check if Hyperledger Fabric network is up and reachable.
     */
    async getNetworkStatus() {
        try {
            const contract = await this.getContract('Manufacturer');
            const resultBytes = await contract.evaluateTransaction('GetAllProducts');
            return {
                connected: true,
                channel: config.CHANNEL_NAME,
                chaincode: config.CHAINCODE_NAME,
                peers: [
                    { name: config.PEER_HOST_ALIAS_ORG1, endpoint: config.PEER_ENDPOINT_ORG1, org: 'Org1MSP (Manufacturer/Distributor)', status: 'Connected' },
                    { name: config.PEER_HOST_ALIAS_ORG2, endpoint: config.PEER_ENDPOINT_ORG2, org: 'Org2MSP (Retailer)', status: 'Connected' }
                ],
                orderer: 'orderer.example.com:7050',
                consensus: 'Raft (etcdraft)',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                connected: false,
                channel: config.CHANNEL_NAME,
                chaincode: config.CHAINCODE_NAME,
                error: error.message || 'Fabric peer unreachable',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Register a new product (Manufacturer only - Org1MSP)
     */
    async createProduct(role, { id, name, description, manufacturer, batchNumber, manufacturingDate, origin }) {
        if (role !== 'Manufacturer') {
            throw new Error('Access Denied: Only Manufacturer role can register new products on the blockchain.');
        }

        const contract = await this.getContract('Manufacturer');
        const commit = await contract.submitTransaction(
            'CreateProduct',
            id,
            name,
            description,
            manufacturer,
            batchNumber,
            manufacturingDate,
            origin
        );

        const decoded = utf8Decoder.decode(commit);
        return JSON.parse(decoded);
    }

    /**
     * Read a product by ID
     */
    async readProduct(id) {
        const contract = await this.getContract('Manufacturer');
        const resultBytes = await contract.evaluateTransaction('ReadProduct', id);
        return JSON.parse(utf8Decoder.decode(resultBytes));
    }

    /**
     * Retrieve all products from the Fabric ledger
     */
    async getAllProducts() {
        const contract = await this.getContract('Manufacturer');
        const resultBytes = await contract.evaluateTransaction('GetAllProducts');
        const decoded = utf8Decoder.decode(resultBytes);
        return decoded ? JSON.parse(decoded) : [];
    }

    /**
     * Transfer product along the supply chain
     */
    async transferProduct(role, id, { newOwner, newLocation, newStatus }) {
        // Use Org1 contract for Manufacturer/Distributor, Org2 contract for Retailer
        const contract = await this.getContract(role);
        const commit = await contract.submitTransaction(
            'TransferProduct',
            id,
            newOwner,
            newLocation || '',
            newStatus || ''
        );
        return JSON.parse(utf8Decoder.decode(commit));
    }

    /**
     * Update product location
     */
    async updateLocation(role, id, newLocation) {
        const contract = await this.getContract(role);
        const commit = await contract.submitTransaction('UpdateLocation', id, newLocation);
        return JSON.parse(utf8Decoder.decode(commit));
    }

    /**
     * Get complete blockchain history for a specific product key
     */
    async getProductHistory(id) {
        const contract = await this.getContract('Manufacturer');
        const resultBytes = await contract.evaluateTransaction('GetProductHistory', id);
        const decoded = utf8Decoder.decode(resultBytes);
        return decoded ? JSON.parse(decoded) : [];
    }

    /**
     * Aggregate real blockchain transactions across all products on ledger
     */
    async getAllTransactions() {
        const products = await this.getAllProducts();
        const transactionsMap = new Map();

        for (const product of products) {
            try {
                const history = await this.getProductHistory(product.id);
                for (const item of history) {
                    if (item && item.txId && !transactionsMap.has(item.txId)) {
                        let type = 'Product Registration';
                        if (item.value) {
                            if (item.value.status === 'Manufactured') {
                                type = 'Registration';
                            } else if (item.value.status && item.value.status.includes('Transit')) {
                                type = 'In Transit';
                            } else if (item.value.status && item.value.status.includes('Received')) {
                                type = 'Receipt Confirmation';
                            } else if (item.value.status === 'Delivered') {
                                type = 'Delivery Completed';
                            } else {
                                type = 'Status/Location Update';
                            }
                        }

                        transactionsMap.set(item.txId, {
                            txId: item.txId,
                            productId: product.id,
                            productName: product.name,
                            type,
                            initiatingOrg: item.value ? (item.value.ownerMsp || item.value.ownerRole || 'Fabric Network') : 'Fabric Network',
                            owner: item.value ? item.value.owner : 'N/A',
                            location: item.value ? item.value.location : 'N/A',
                            status: item.value ? item.value.status : 'Committed',
                            timestamp: item.timestamp,
                            isDelete: item.isDelete,
                            details: item.value
                        });
                    }
                }
            } catch (err) {
                console.error(`Error fetching history for ${product.id}:`, err.message);
            }
        }

        // Return array sorted newest first
        const allTx = Array.from(transactionsMap.values());
        allTx.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return allTx;
    }

    close() {
        for (const key of Object.keys(this.gateways)) {
            if (this.gateways[key]) this.gateways[key].close();
            if (this.clients[key]) this.clients[key].close();
        }
    }
}

module.exports = new FabricService();
