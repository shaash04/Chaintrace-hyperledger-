# ChainTrace - Blockchain-Based Supply Chain Management Application

**ChainTrace** is an enterprise-grade, clean, and practical Supply Chain Management decentralized application (DApp) built on **Hyperledger Fabric v2.5**, powered by an **Express.js (Node.js)** backend using the **Fabric Gateway SDK**, and an interactive **React (Vite + Tailwind CSS)** enterprise dashboard.

---

## 1. Project Architecture & Components

```
chaintrace/
├── frontend/               # React.js + Vite + Tailwind CSS + Lucide Icons Dashboard
│   ├── src/
│   │   ├── components/     # Sidebar (4 modules), Header, LoginModal, NetworkAlert
│   │   ├── pages/          # Dashboard, Products, Tracking, BlockchainHistory
│   │   ├── context/        # AuthContext (Role-Based Access Control)
│   │   ├── api.js          # REST Client connected to Express Backend
│   │   ├── App.jsx         # Core Application Router & View State
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/                # Node.js + Express REST API server
│   ├── fabricService.js    # Hyperledger Fabric Gateway SDK Integration (@hyperledger/fabric-gateway)
│   ├── config.js           # MSP and TLS connection configurations
│   ├── routes/
│   │   ├── productRoutes.js    # /api/products (CRUD, Transfer, Location, History)
│   │   └── blockchainRoutes.js # /api/blockchain (Transactions, Network Status)
│   ├── server.js           # Express App Entry Point (Port 5000)
│   └── package.json
├── blockchain/
│   ├── chaincode/          # JavaScript Smart Contract (Chaincode-as-a-Service)
│   │   ├── lib/
│   │   │   └── supplyChainContract.js # CreateProduct, ReadProduct, TransferProduct, GetProductHistory
│   │   ├── index.js
│   │   ├── Dockerfile      # CCAAS Container Definition
│   │   └── package.json
│   ├── network/            # Channel artifacts, Crypto-config, and Connection Profiles
│   │   └── organizations/  # MSP identities (Org1MSP, Org2MSP, OrdererMSP)
│   └── scripts/            # Network lifecycle & testing automation
│       ├── startNetwork.sh # Complete network bootstrap & deployment
│       ├── stopNetwork.sh  # Clean shutdown
│       ├── deployChaincode.sh # Chaincode packaging & deployment
│       ├── reloadCCAAS.sh  # Hot reload for chaincode containers
│       └── testLedger.sh   # Direct CLI verification test
├── README.md               # Complete Documentation & Viva Guide
└── .env.example            # Environment variables template
```

---

## 2. Technology Stack

- **Blockchain Platform**: Hyperledger Fabric v2.5 (LTS)
- **Consensus**: Raft (Crash Fault Tolerant - `etcdraft`)
- **Channel**: `supplychannel`
- **Smart Contract (Chaincode)**: `supplychain` (Node.js / JavaScript)
- **Deployment Model**: Chaincode-as-a-Service (CCAAS) on `fabric_test` Docker network
- **Organizations**:
  - **Org1MSP**: Manufacturer (`peer0.org1.example.com:7051`)
  - **Org2MSP**: Retailer (`peer0.org2.example.com:9051`)
  - **OrdererOrg**: Raft Ordering Service (`orderer.example.com:7050`)
- **Backend**: Node.js v20+, Express.js, `@hyperledger/fabric-gateway`, `@grpc/grpc-js`
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React

---

## 3. Role-Based Access Control (RBAC) Mapping

ChainTrace enforces strict role-based authorization at both the API and Smart Contract levels:

| Role | Organization Identity | Fabric MSP | Authorized Operations |
| :--- | :--- | :--- | :--- |
| **Manufacturer** | Apex Manufacturing Corp (`User1@org1.example.com`) | `Org1MSP` | • Register new products (`CreateProduct`)<br>• Initial dispatch to distributor (`TransferProduct`)<br>• View all products & ledger history |
| **Distributor** | Logistics Express Hub (`User1@org1.example.com`) | `Org1MSP` / `Org2MSP` | • Receive items at warehouse hub (`TransferProduct`)<br>• Update real-time transit location (`UpdateLocation`)<br>• Dispatch items to retailer (`TransferProduct`)<br>• *Forbidden from registering new products* |
| **Retailer** | Metro Retail Stores (`User1@org2.example.com`) | `Org2MSP` | • Confirm customer delivery & store receipt (`TransferProduct`)<br>• Inspect verified provenance & blockchain history<br>• *Forbidden from creating products or backwards transfer* |

---

## 4. Supply Chain Workflow (3-Stage Lifecycle)

```
[ Stage 1: Manufacturer ]  ──► [ Stage 2: Distributor ]  ──► [ Stage 3: Retailer ]
  • CreateProduct()               • Received by Distributor     • Confirm Delivery
  • Status: Manufactured          • UpdateLocation()            • Status: Delivered
  • Dispatch to Distributor       • Dispatch to Retailer        • Lifecycle Complete
```

1. **Manufacturer** mints product on blockchain with Batch No, Date, Origin.
2. **Manufacturer** transfers custody to **Distributor** (`In Transit to Distributor`).
3. **Distributor** marks package received at warehouse (`Received by Distributor`).
4. **Distributor** updates location waypoints (`UpdateLocation`).
5. **Distributor** transfers custody to **Retailer** (`In Transit to Retailer`).
6. **Retailer** inspects provenance and confirms delivery (`Delivered`).

---

## 5. Live Service URLs

| Service | URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **React Frontend** | `http://localhost:3000` | **ONLINE** | Interactive Enterprise UI Dashboard |
| **Backend API** | `http://localhost:5000` | **ONLINE** | Express Server & Fabric Gateway |
| **Health & Status** | `http://localhost:5000/api/health` | **ONLINE** | Peer Connectivity & Channel Status |
| **Transactions API**| `http://localhost:5000/api/blockchain/transactions` | **ONLINE** | Ledger Transaction Stream |

---

## 6. Commands to Start and Stop the Application

### Prerequisites
- Windows 10/11 with WSL2 (Ubuntu 22.04 LTS)
- Docker & Docker Compose installed in WSL2
- Node.js v18+ and npm

### Step 1: Start the Hyperledger Fabric Network
In WSL2 terminal:
```bash
cd /mnt/c/Users/tshal/Downloads/hyper/chaintrace/blockchain/scripts
chmod +x *.sh
./startNetwork.sh
```
*This starts the orderer, peer0.org1, peer0.org2, creates the channel `supplychannel`, and deploys the chaincode container `supplychain`.*

### Step 2: Start the Backend Server
In PowerShell:
```powershell
cd c:\Users\tshal\Downloads\hyper\chaintrace\backend
npm install
node server.js
```
*Backend runs on `http://localhost:5000` and establishes gRPC connection to Fabric Peer0.*

### Step 3: Start the React Frontend
In PowerShell:
```powershell
cd c:\Users\tshal\Downloads\hyper\chaintrace\frontend
npm install
npm run dev -- --port 3000
```
*Open `http://localhost:3000` in your web browser.*

### Step 4: Stop the Network (When Finished)
In WSL2 terminal:
```bash
cd /mnt/c/Users/tshal/Downloads/hyper/chaintrace/blockchain/scripts
./stopNetwork.sh
```

---

## 7. Actual Tested Blockchain Transactions (Ledger Proof)

The following transactions were executed and verified directly on the running **Hyperledger Fabric** network during testing:

### Product: `PROD-201` (Industrial Cold-Chain Vaccine Carrier)

| Milestone | Transaction ID (Fabric Cryptographic Hash) | Stage | Owner | Location | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Mint / Register** | `18b1db61a934830434718568d70a840c84206ee3506f0b3131af22d47a2d5eaf` | Manufacturer | BioShield Pharma Corp | Bengaluru BioTech Park | Manufactured |
| **2. Dispatch to Distro** | `f4accd5e89b6209a90559519dc1431bf84af78665d625558e3a3492bd8e0eead` | Distributor | Logistics Express Warehouse | Hyderabad Distribution Hub | In Transit to Distributor |
| **3. Receive at Hub** | `db7082387a552a8fbc19c8620ad63e7630672b527aaeda7bfe7c02cd48ed1a0b` | Distributor | Logistics Express Warehouse | Hyderabad Distribution Hub Vault 4 | Received by Distributor |
| **4. Dispatch to Retail** | `0647576a7648916d17b86014cb297ce2cb14b64922f3f4948ce4e476c7417a41` | Retailer | Metro Apex Superstore | Mumbai Central Hospital Pharmacy | In Transit to Retailer |
| **5. Confirm Delivery** | `be0261bc6ccb4326b45d1b51c971d9e185be5fe89ef1d99d81a65ed5a4a170df` | Delivered | Metro Apex Superstore | Mumbai Central Hospital Pharmacy Store #12 | Delivered |

### Verified REST API Output Sample:
```json
{
  "success": true,
  "productId": "PROD-201",
  "count": 5,
  "data": [
    {
      "txId": "be0261bc6ccb4326b45d1b51c971d9e185be5fe89ef1d99d81a65ed5a4a170df",
      "timestamp": "2026-11-05T06:48:00.707Z",
      "isDelete": false,
      "value": {
        "id": "PROD-201",
        "name": "Industrial Cold-Chain Vaccine Carrier",
        "owner": "Metro Apex Superstore",
        "ownerRole": "Retailer",
        "ownerMsp": "Org1MSP",
        "location": "Mumbai Central Hospital Pharmacy Store #12",
        "status": "Delivered",
        "stage": "Delivered"
      }
    }
  ]
}
```

---

## 8. College Practical & Viva Examination Q&A Guide

**Q1: What consensus mechanism is used in this Hyperledger Fabric network?**
> A: Raft consensus (`etcdraft`). It is a leader-follower crash fault-tolerant (CFT) ordering service where the orderer node (`orderer.example.com`) sequences transactions into blocks and signs them.

**Q2: How does the backend communicate with Hyperledger Fabric without a database?**
> A: Using the official `@hyperledger/fabric-gateway` SDK over gRPC with Mutual TLS. Transactions are submitted to Peer endorsers, ordered into blocks by the Raft ordering service, and committed to the LevelDB/CouchDB state database of each peer. The ledger is the single source of truth.

**Q3: How is history tracked on the blockchain?**
> A: Through Fabric's native `ctx.stub.getHistoryForKey(id)` API inside the chaincode. It returns every past modification, associated cryptographic transaction hash (`txId`), timestamp, and state snapshot directly from the peer's block store.

**Q4: How does role-based security work?**
> A: Through Fabric's Membership Service Provider (MSP) and Client Identity (`ctx.clientIdentity.getMSPID()`). Org1MSP represents production/manufacturing, while Org2MSP represents the retail network. The smart contract validates that only Org1 can invoke `CreateProduct`, preventing unauthorized actors from minting assets.
