#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CHAINTRACE_DIR="$( cd "$DIR/../.." >/dev/null 2>&1 && pwd )"
TEST_NET_DIR="/opt/fabric/fabric-samples/test-network"

echo "=========================================================="
echo "Starting ChainTrace Hyperledger Fabric Network"
echo "Channel: supplychannel | Chaincode: supplychain"
echo "=========================================================="

# Ensure dockerd is running
pgrep dockerd >/dev/null || (dockerd > /var/log/dockerd.log 2>&1 & sleep 3)

cd "$TEST_NET_DIR"
./network.sh down || true
./network.sh up createChannel -c supplychannel

# Copy latest chaincode and deploy via CCAAS
rm -rf /opt/fabric/chaincode/supplychain
mkdir -p /opt/fabric/chaincode/supplychain
cp -r "$CHAINTRACE_DIR/blockchain/chaincode/"* /opt/fabric/chaincode/supplychain/

./network.sh deployCCAAS -c supplychannel -ccn supplychain -ccp /opt/fabric/chaincode/supplychain

# Run initial ledger seed
echo "Initializing ledger with initial sample product..."
export FABRIC_CFG_PATH=/opt/fabric/fabric-samples/config/
. scripts/envVar.sh
setGlobals 1
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "$TEST_NET_DIR/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem" \
  -C supplychannel \
  -n supplychain \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "$TEST_NET_DIR/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "$TEST_NET_DIR/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem" \
  -c '{"function":"InitLedger","Args":[]}' \
  --waitForEvent

echo "=========================================================="
echo "ChainTrace Fabric Network is live and operational!"
echo "=========================================================="
