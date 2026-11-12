#!/usr/bin/env bash
set -e

TEST_NET_DIR="/opt/fabric/fabric-samples/test-network"
echo "Stopping ChainTrace Fabric Network..."
cd "$TEST_NET_DIR"
./network.sh down
docker stop peer0org1_supplychain_ccaas peer0org2_supplychain_ccaas 2>/dev/null || true
echo "Network stopped."
