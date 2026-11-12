#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
CHAINTRACE_DIR="$( cd "$DIR/../.." >/dev/null 2>&1 && pwd )"
TEST_NET_DIR="/opt/fabric/fabric-samples/test-network"

echo "Deploying ChainTrace smart contract..."
rm -rf /opt/fabric/chaincode/supplychain
mkdir -p /opt/fabric/chaincode/supplychain
cp -r "$CHAINTRACE_DIR/blockchain/chaincode/"* /opt/fabric/chaincode/supplychain/

cd "$TEST_NET_DIR"
./network.sh deployCCAAS -c supplychannel -ccn supplychain -ccp /opt/fabric/chaincode/supplychain
echo "Chaincode deployed successfully."
