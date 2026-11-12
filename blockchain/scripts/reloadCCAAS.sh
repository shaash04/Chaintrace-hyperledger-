#!/usr/bin/env bash
set -e

CC_ID=$(docker inspect peer0org1_supplychain_ccaas | jq -r '.[0].Config.Env[] | select(startswith("CHAINCODE_ID=")) | split("=")[1]')
echo "Found Chaincode ID: $CC_ID"

docker stop peer0org1_supplychain_ccaas peer0org2_supplychain_ccaas || true
sleep 1

docker run --rm -d --name peer0org1_supplychain_ccaas \
  --network fabric_test \
  -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
  -e CHAINCODE_ID=$CC_ID \
  -e CORE_CHAINCODE_ID_NAME=$CC_ID \
  supplychain_ccaas_image:latest

docker run --rm -d --name peer0org2_supplychain_ccaas \
  --network fabric_test \
  -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
  -e CHAINCODE_ID=$CC_ID \
  -e CORE_CHAINCODE_ID_NAME=$CC_ID \
  supplychain_ccaas_image:latest

echo "Containers successfully replaced with latest image:"
docker ps --filter "name=ccaas"
