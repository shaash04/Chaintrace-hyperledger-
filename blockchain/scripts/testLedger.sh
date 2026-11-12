#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
TEST_NET_DIR="/opt/fabric/fabric-samples/test-network"

export FABRIC_CFG_PATH="/opt/fabric/fabric-samples/config/"
export PATH="/usr/local/bin:$PATH"

cd "$TEST_NET_DIR"
. scripts/envVar.sh
setGlobals 1

echo "=========================================================="
echo "ChainTrace: Testing Supply Chain Smart Contract on Fabric"
echo "=========================================================="

echo ""
echo "-> 1. Reading existing product PROD-101..."
peer chaincode query \
  -C supplychannel \
  -n supplychain \
  -c '{"Args":["ReadProduct","PROD-101"]}'

echo ""
echo "-> 2. Querying product PROD-101 blockchain history..."
peer chaincode query \
  -C supplychannel \
  -n supplychain \
  -c '{"Args":["GetProductHistory","PROD-101"]}'

echo ""
echo "-> 3. Transferring PROD-101 to Distributor (Logistics Express)..."
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
  -c '{"function":"TransferProduct","Args":["PROD-101","Logistics Express","Nagpur Central Hub","In Transit to Distributor"]}' \
  --waitForEvent

echo ""
echo "-> 4. Updating Location of PROD-101..."
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
  -c '{"function":"UpdateLocation","Args":["PROD-101","Indore Transit Depot"]}' \
  --waitForEvent

echo ""
echo "-> 5. Querying full blockchain history of PROD-101 after transfers..."
peer chaincode query \
  -C supplychannel \
  -n supplychain \
  -c '{"Args":["GetProductHistory","PROD-101"]}'

echo ""
echo "=========================================================="
echo "ChainTrace: Smart contract test completed with 100% success!"
echo "=========================================================="
