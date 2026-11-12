# ChainTrace Supply Chain Smart Contract CCAAS Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./
COPY lib/ ./lib/

ENV PORT=9999
EXPOSE 9999

CMD ["sh", "-c", "npx fabric-chaincode-node server --chaincode-address=0.0.0.0:9999 --chaincode-id=$CHAINCODE_ID"]
