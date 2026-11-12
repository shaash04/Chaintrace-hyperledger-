const path = require('path');
require('dotenv').config();

const ORGS_DIR = process.env.FABRIC_ORGS_DIR || path.resolve(__dirname, '../blockchain/network/organizations');

module.exports = {
    PORT: process.env.PORT || 5000,
    CHANNEL_NAME: process.env.CHANNEL_NAME || 'supplychannel',
    CHAINCODE_NAME: process.env.CHAINCODE_NAME || 'supplychain',
    PEER_ENDPOINT_ORG1: process.env.PEER_ENDPOINT_ORG1 || '127.0.0.1:7051',
    PEER_HOST_ALIAS_ORG1: process.env.PEER_HOST_ALIAS_ORG1 || 'peer0.org1.example.com',
    PEER_ENDPOINT_ORG2: process.env.PEER_ENDPOINT_ORG2 || '127.0.0.1:9051',
    PEER_HOST_ALIAS_ORG2: process.env.PEER_HOST_ALIAS_ORG2 || 'peer0.org2.example.com',

    ORG1: {
        mspId: 'Org1MSP',
        tlsCertPath: path.join(ORGS_DIR, 'peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt'),
        certPath: path.join(ORGS_DIR, 'peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem'),
        keyPath: path.join(ORGS_DIR, 'peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk'),
    },

    ORG2: {
        mspId: 'Org2MSP',
        tlsCertPath: path.join(ORGS_DIR, 'peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt'),
        certPath: path.join(ORGS_DIR, 'peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/signcerts/User1@org2.example.com-cert.pem'),
        keyPath: path.join(ORGS_DIR, 'peerOrganizations/org2.example.com/users/User1@org2.example.com/msp/keystore/priv_sk'),
    }
};
