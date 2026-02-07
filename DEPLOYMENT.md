# Aniki Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
git clone <your-repo-url>
cd aniki
npm install
npm run build
```

## 🔧 Configuration

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Key Configuration Variables

```bash
# Network Selection
SUI_NETWORK=devnet  # mainnet, testnet, devnet, localnet

# Wallet Configuration (NEVER commit real keys!)
COLD_WALLET_ADDRESS=0x...
HOT_WALLET_ADDRESS=0x...

# Security Thresholds (in SUI)
COLD_WALLET_THRESHOLD=100000  # Amount requiring cold wallet
HOT_WALLET_THRESHOLD=10000    # Max amount for hot wallet

# Multi-Signature
MULTISIG_ENABLED=true
MULTISIG_THRESHOLD=2
MULTISIG_SIGNER_1=0x...
MULTISIG_SIGNER_2=0x...
MULTISIG_SIGNER_3=0x...

# Fraud Detection
FRAUD_DETECTION_ENABLED=true
MAX_DAILY_VOLUME=500000
ALERT_WEBHOOK_URL=https://alerts.your-app.com/fraud
```

## 🌊 Sui Blockchain Setup

### 1. Install Sui CLI
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

### 2. Deploy Move Contracts
```bash
cd move/aniki_treasury
sui move build
sui client publish --gas-budget 1000000000
```

### 3. Update Contract Addresses
```bash
# Add deployed contract addresses to .env
TREASURY_PACKAGE_ID=0x...
TREASURY_OBJECT_ID=0x...
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode  
```bash
npm run build
npm start
```

### Run Demo
```bash
npm run demo
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Tests
```bash
npm test -- --testNamePattern="Aniki Core"
```

## 🔐 Security Deployment

### Cold Wallet Setup
1. **Hardware Wallet Recommended**
   - Ledger or Trezor support
   - Air-gapped signing process
   - Never expose private keys

2. **Cold Wallet Configuration**
   ```typescript
   const securityConfig = createSecurityConfig(
     'COLD_WALLET_ADDRESS',  // From hardware wallet
     'HOT_WALLET_ADDRESS',   // For daily operations
     {
       coldThreshold: 100000,  // Triggers cold approval
       hotThreshold: 10000,    // Max hot wallet amount
     }
   );
   ```

### Multi-Signature Setup
```bash
# Generate multi-sig addresses
sui keytool generate ed25519  # Repeat for each signer
sui client multi-sig-address --threshold 2 \
  --pks <pubkey1> <pubkey2> <pubkey3>
```

### Security Checklist
- ✅ Cold wallet never connected to internet
- ✅ Multi-sig threshold properly configured
- ✅ Fraud detection alerts working
- ✅ Emergency stop procedures tested
- ✅ Daily limits appropriately set

## 🔄 Monitoring & Operations

### Health Checks
```bash
# System status
curl http://localhost:3000/health

# Security status
curl http://localhost:3000/security/status

# Treasury status
curl http://localhost:3000/treasury/status
```

### Logging
```bash
# View logs
tail -f logs/aniki.log

# Error logs
grep "ERROR" logs/aniki.log

# Security alerts
grep "SECURITY" logs/aniki.log
```

### Alerts & Notifications
- **Fraud Detection** - Webhook to your alert system
- **Emergency Mode** - Immediate notifications
- **Low Balance** - Daily balance warnings
- **Multi-Sig** - Approval request notifications

## 🚨 Emergency Procedures

### Emergency Stop
```bash
# Activate emergency mode
npm run emergency-stop "Security incident detected"

# Deactivate emergency mode (requires admin auth)
npm run emergency-deactivate --auth-code "EMERGENCY_OVERRIDE_2026"
```

### Fund Recovery
```bash
# Move all funds to cold wallet
npm run emergency-secure

# Check fund status
npm run check-balances
```

## 📊 Performance Tuning

### Gas Optimization
```typescript
// Configure gas optimization
const aniki = createAniki({
  gasOptimization: true,
  batchThreshold: 3,      // Min transactions to batch
  maxGasPrice: 2000,      // Max gas price in MIST
});
```

### Concurrency Settings
```typescript
// Agent orchestration tuning
const agentConfig = {
  maxConcurrentTasks: 10,  // Max parallel agents
  taskTimeout: 600000,     // 10 minute timeout
  retryAttempts: 3,        // Max retries
  retryBackoff: 1000,      // Backoff in ms
};
```

## 🔧 Troubleshooting

### Common Issues

**1. Connection Errors**
```bash
# Check RPC endpoints
sui client envs
sui client active-env

# Test connection
sui client gas
```

**2. Transaction Failures**
```bash
# Check gas balance
sui client gas

# Verify wallet addresses
sui client addresses
```

**3. Smart Contract Issues**
```bash
# Verify contract deployment
sui client object <TREASURY_OBJECT_ID>

# Check contract functions
sui move build --path move/aniki_treasury
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run demo
```

### Support
- 📖 **Documentation:** [README.md](./README.md)
- 🐛 **Issues:** GitHub Issues
- 💬 **Discord:** OpenClaw Community

## 📈 Scaling Considerations

### Production Deployment
- **Load Balancer** - Multiple Aniki instances
- **Database** - Persistent state storage
- **Monitoring** - Prometheus + Grafana
- **Backup** - Automated state backups

### Enterprise Features
- **Web Dashboard** - Administrative interface
- **API Gateway** - Rate limiting and auth
- **Audit Logging** - Compliance requirements
- **High Availability** - Multi-region deployment

---

**Aniki - Production-ready autonomous treasury management for Sui! 🚀**