'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChainContract extends Contract {

    constructor() {
        super('SupplyChainContract');
    }

    _getTxTimestampIso(ctx) {
        try {
            const txTimestamp = ctx.stub.getTxTimestamp();
            if (txTimestamp && txTimestamp.seconds) {
                const sec = txTimestamp.seconds.low !== undefined ? txTimestamp.seconds.low : Number(txTimestamp.seconds);
                const nanos = (txTimestamp.nanos && txTimestamp.nanos.low !== undefined) ? txTimestamp.nanos.low : Number(txTimestamp.nanos || 0);
                return new Date(sec * 1000 + Math.round(nanos / 1000000)).toISOString();
            }
        } catch (err) {
            // fallback
        }
        return new Date().toISOString();
    }

    _formatHistoryTimestamp(ts) {
        try {
            if (ts) {
                if (typeof ts.toDate === 'function') {
                    return ts.toDate().toISOString();
                }
                const sec = ts.seconds ? (ts.seconds.low !== undefined ? ts.seconds.low : Number(ts.seconds)) : (typeof ts === 'number' ? ts : 0);
                const nanos = ts.nanos ? (ts.nanos.low !== undefined ? ts.nanos.low : Number(ts.nanos)) : 0;
                if (sec > 0) {
                    return new Date(sec * 1000 + Math.round(nanos / 1000000)).toISOString();
                }
            }
        } catch (err) {
            // fallback
        }
        return new Date().toISOString();
    }

    /**
     * Initialize the ledger with a sample product for quick demonstration.
     */
    async InitLedger(ctx) {
        const sampleProducts = [
            {
                id: 'PROD-001',
                name: 'Organic Honey (500g)',
                description: 'Pure organic raw mountain honey, batch verified.',
                manufacturer: 'BeePure Organics Ltd',
                batchNumber: 'BP-2026-H01',
                manufacturingDate: '2026-10-15',
                origin: 'Himachal Pradesh, India',
                owner: 'BeePure Organics Ltd',
                ownerRole: 'Manufacturer',
                ownerMsp: 'Org1MSP',
                location: 'Shimla Processing Facility',
                status: 'Manufactured',
                stage: 'Manufacturer',
                createdAt: '2026-10-15T09:00:00.000Z',
                updatedAt: '2026-10-15T09:00:00.000Z'
            }
        ];

        for (const product of sampleProducts) {
            await ctx.stub.putState(product.id, Buffer.from(JSON.stringify(product)));
        }
        return JSON.stringify({ message: 'Ledger initialized successfully with sample data' });
    }

    /**
     * Helper method to verify if a product exists.
     */
    async ProductExists(ctx, id) {
        const productJSON = await ctx.stub.getState(id);
        return productJSON && productJSON.length > 0;
    }

    /**
     * CreateProduct: Only Manufacturer (Org1MSP) can register new products.
     */
    async CreateProduct(ctx, id, name, description, manufacturer, batchNumber, manufacturingDate, origin) {
        if (!id || !name || !description || !manufacturer || !batchNumber || !manufacturingDate || !origin) {
            throw new Error('All product fields are required: id, name, description, manufacturer, batchNumber, manufacturingDate, origin.');
        }

        const exists = await this.ProductExists(ctx, id);
        if (exists) {
            throw new Error(`Product with ID "${id}" already exists on the blockchain.`);
        }

        // Verify client identity MSP
        const callerMsp = ctx.clientIdentity.getMSPID();
        if (callerMsp !== 'Org1MSP') {
            throw new Error(`Unauthorized: Invoker MSP (${callerMsp}) is not authorized to register products. Only Manufacturer (Org1MSP) can register products.`);
        }

        const timestampIso = this._getTxTimestampIso(ctx);

        const product = {
            id,
            name,
            description,
            manufacturer,
            batchNumber,
            manufacturingDate,
            origin,
            owner: manufacturer,
            ownerRole: 'Manufacturer',
            ownerMsp: callerMsp,
            location: origin,
            status: 'Manufactured',
            stage: 'Manufacturer',
            createdAt: timestampIso,
            updatedAt: timestampIso
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        // Emit Fabric event for listeners
        ctx.stub.setEvent('ProductCreated', Buffer.from(JSON.stringify(product)));

        return JSON.stringify(product);
    }

    /**
     * ReadProduct: Read product state by ID.
     */
    async ReadProduct(ctx, id) {
        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product with ID "${id}" does not exist on the ledger.`);
        }
        return productJSON.toString('utf8');
    }

    /**
     * GetAllProducts: Retrieve all registered products from the ledger.
     */
    async GetAllProducts(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            if (record && record.id) {
                allResults.push(record);
            }
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(allResults);
    }

    /**
     * TransferProduct: Enforces three-stage supply chain (Manufacturer -> Distributor -> Retailer).
     * Validates current ownership, stages, and caller MSP.
     */
    async TransferProduct(ctx, id, newOwner, newLocation, newStatus) {
        if (!id || !newOwner) {
            throw new Error('Product ID and new owner are required for transfer.');
        }

        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product with ID "${id}" does not exist.`);
        }

        const product = JSON.parse(productJSON.toString('utf8'));
        const callerMsp = ctx.clientIdentity.getMSPID();

        // Stage 1: Current stage is Manufacturer
        if (product.stage === 'Manufacturer') {
            if (callerMsp !== 'Org1MSP') {
                throw new Error(`Unauthorized: Only Manufacturer (Org1MSP) can transfer product from stage "Manufacturer". Invoking MSP: ${callerMsp}`);
            }

            product.owner = newOwner;
            product.ownerRole = 'Distributor';
            product.stage = 'Distributor';
            product.status = newStatus || 'In Transit to Distributor';
            if (newLocation) product.location = newLocation;
        }
        // Stage 2: Current stage is Distributor
        else if (product.stage === 'Distributor') {
            const isReceiving = newStatus && newStatus.toLowerCase().includes('received');

            if (isReceiving) {
                product.status = newStatus || 'Received by Distributor';
                if (newLocation) product.location = newLocation;
                if (newOwner) product.owner = newOwner;
            } else {
                product.owner = newOwner;
                product.ownerRole = 'Retailer';
                product.stage = 'Retailer';
                product.status = newStatus || 'In Transit to Retailer';
                if (newLocation) product.location = newLocation;
            }
        }
        // Stage 3: Current stage is Retailer
        else if (product.stage === 'Retailer') {
            product.status = newStatus || 'Delivered';
            if (newOwner) product.owner = newOwner;
            if (newLocation) product.location = newLocation;
            if (product.status === 'Delivered') {
                product.stage = 'Delivered';
            }
        }
        else if (product.stage === 'Delivered') {
            throw new Error(`Product "${id}" has already completed the supply chain lifecycle and is marked Delivered.`);
        }
        else {
            product.owner = newOwner;
            if (newLocation) product.location = newLocation;
            if (newStatus) product.status = newStatus;
        }

        product.updatedAt = this._getTxTimestampIso(ctx);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        ctx.stub.setEvent('ProductTransferred', Buffer.from(JSON.stringify({
            id,
            newOwner: product.owner,
            status: product.status,
            stage: product.stage,
            location: product.location
        })));

        return JSON.stringify(product);
    }

    /**
     * UpdateLocation: Update physical location of a product along its journey.
     */
    async UpdateLocation(ctx, id, newLocation) {
        if (!id || !newLocation) {
            throw new Error('Product ID and new location are required.');
        }

        const productJSON = await ctx.stub.getState(id);
        if (!productJSON || productJSON.length === 0) {
            throw new Error(`Product with ID "${id}" does not exist.`);
        }

        const product = JSON.parse(productJSON.toString('utf8'));
        product.location = newLocation;
        product.updatedAt = this._getTxTimestampIso(ctx);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        return JSON.stringify(product);
    }

    /**
     * GetProductHistory: Uses ctx.stub.getHistoryForKey() to return the real
     * cryptographically verified transaction history directly from Hyperledger Fabric's ledger.
     */
    async GetProductHistory(ctx, id) {
        if (!id) {
            throw new Error('Product ID is required.');
        }

        const iterator = await ctx.stub.getHistoryForKey(id);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const historyItem = {
                txId: result.value.txId,
                timestamp: this._formatHistoryTimestamp(result.value.timestamp),
                isDelete: result.value.isDelete
            };

            if (result.value.value && result.value.value.length > 0) {
                try {
                    historyItem.value = JSON.parse(result.value.value.toString('utf8'));
                } catch (err) {
                    historyItem.value = result.value.value.toString('utf8');
                }
            } else {
                historyItem.value = null;
            }

            history.push(historyItem);
            result = await iterator.next();
        }
        await iterator.close();

        return JSON.stringify(history);
    }
}

module.exports = SupplyChainContract;
