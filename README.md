# Aniki (兄貴)

**Autonomous Agent Treasury Management on Sui Blockchain**

![Status](https://img.shields.io/badge/status-hackathon-yellow?style=flat-square)
![Tests](https://img.shields.io/badge/tests-building-blue?style=flat-square)
![Sui](https://img.shields.io/badge/powered%20by-sui-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

🏆 **OpenClaw Hackathon Entry** (Feb 11, 2026 Deadline)  
🎯 **Track:** Safety & Security (Wallet Air-Gap & Security Features)  
💰 **Prize Target:** Top 5 ($1,900 each)

## What is Aniki?

Aniki (兄貴, meaning "big brother" in Japanese) is an autonomous agent treasury management system built on Sui blockchain. Based on the successful Butler project, Aniki brings AI agent orchestration and treasury management to the Sui ecosystem with enhanced security features.

### Key Features

🧹 **🌟 Janitor Service - Our Key Innovation**
- Intelligent memory management with automatic garbage collection
- Token cache optimization with LRU eviction and compression
- Predictive cleanup to prevent performance degradation
- Real-time performance monitoring and optimization recommendations
- Emergency cleanup protocols for resource-constrained environments

🛡️ **Security-First Design**
- Air-gapped wallet management with cold storage integration
- Multi-signature support for high-value transactions  
- Secure key management with hardware wallet integration
- Real-time fraud detection and alerting

⚡ **Sui Stack Integration**
- Native Sui Move smart contracts for treasury operations
- SuiNS integration for human-readable addresses
- Sui RPC client with failover and load balancing
- Full Sui SDK integration for seamless operations

🤖 **Agent Orchestration**
- Multi-agent coordination on Sui network
- Autonomous treasury management with SUI tokens
- Task decomposition and parallel execution
- Budget allocation and tracking across agents

💰 **Treasury Management**
- SUI token balance monitoring and management
- Automated gas fee optimization
- Cross-chain bridge integration for asset movement
- Transaction batching for cost efficiency

## Architecture

```
Aniki
├── 🧹 Janitor Service (NEW!)
│   ├── Memory Management
│   ├── Cache Optimization
│   ├── Performance Monitoring
│   └── Predictive Cleanup
├── Sui Integration Layer
│   ├── Sui RPC Client (with failover)
│   ├── Move Contract Interface
│   ├── SuiNS Resolution
│   └── Gas Management
├── Security Core
│   ├── Air-Gap Wallet Manager
│   ├── Multi-Sig Coordinator  
│   ├── Hardware Wallet Interface
│   └── Fraud Detection Engine
├── Agent Orchestrator (from Butler)
│   ├── Task Decomposition
│   ├── Agent Spawning
│   ├── Budget Allocation
│   └── Result Aggregation
└── Treasury Manager
    ├── SUI Balance Monitoring
    ├── Gas Optimization
    ├── Transaction Batching
    └── Cross-Chain Bridge
```

## Quick Start

### Prerequisites

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

### Installation

```bash
git clone https://github.com/your-username/aniki.git
cd aniki
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your Sui RPC endpoints and keys
```

### Basic Usage

```typescript
import { Aniki } from './src/Aniki';

const aniki = new Aniki({
  network: 'devnet',
  securityLevel: 'high', // Enable air-gap mode
  multiSig: true
});

// Initialize with air-gap security
await aniki.initializeSecure({
  coldWallet: '0x...', // Hardware wallet address
  hotWallet: '0x...', // Hot wallet for small transactions
  threshold: { cold: 1000000, hot: 100000 } // SUI amounts
});

// Spawn secure agent with treasury access
const result = await aniki.spawnSecureAgent({
  task: 'Monitor DeFi positions and rebalance portfolio',
  budget: 50000, // SUI units
  securityRequired: true,
  approvalThreshold: 10000
});
```

## 🧹 Janitor Service - Memory Management & Optimization

### Automatic Memory Management

```typescript
// Get current memory status and recommendations
const janitorStatus = aniki.getJanitorStatus();
console.log(`Memory usage: ${janitorStatus.memory.heapUsed}`);
console.log(`Cache hit rate: ${janitorStatus.cache.tokenCache.hitRate}`);

// Get optimization recommendations
const recommendations = aniki.getOptimizationRecommendations();
recommendations.forEach(rec => console.log(rec));

// Perform manual optimization
const result = await aniki.optimizeMemory();
console.log(`Memory freed: ${result.freed}`);
```

### Intelligent Token Caching

```typescript
// Cache token data with automatic compression
await aniki.cacheTokens('portfolio_data', {
  tokens: [...], // Large token dataset
  balances: [...],
  metadata: [...]
}, 3600000); // 1 hour TTL

// Retrieve from cache (instant if cached)
const cachedData = await aniki.getCachedTokens('portfolio_data');
if (cachedData) {
  console.log('Cache hit - instant retrieval!');
}

// View cache performance
const cacheStats = aniki.getCacheStats();
console.log(`Hit rate: ${cacheStats.tokenCache.hitRate * 100}%`);
```

### Performance Monitoring

```typescript
// Configure janitor for your workload
aniki.configureJanitor({
  maxMemoryMB: 1024,        // 1GB memory limit
  cleanupIntervalMs: 300000, // 5 minutes
  enableCompression: true,   // Enable compression
  cacheMaxSizeMB: 128       // 128MB cache limit
});

// Emergency cleanup if needed
await aniki.emergencyMemoryCleanup();
```

## Security Features

### 1. Air-Gap Wallet Management

```typescript
// Transactions above threshold require cold wallet approval
const transaction = await aniki.createTransaction({
  amount: 500000, // > cold threshold
  recipient: '0x...',
  approvalMode: 'cold-wallet'
});

// Air-gap signing process initiated
console.log(`Cold wallet approval required: ${transaction.approvalUrl}`);
```

### 2. Multi-Signature Support

```typescript
// Configure multi-sig for high-value operations
await aniki.setupMultiSig({
  signers: ['0x...', '0x...', '0x...'],
  threshold: 2, // 2 of 3 signatures required
  minAmount: 100000 // SUI threshold for multi-sig
});
```

### 3. Fraud Detection

```typescript
// Real-time monitoring with ML-based detection
aniki.enableFraudDetection({
  maxDailyVolume: 1000000,
  suspiciousPatterns: ['rapid-fire', 'unusual-hours'],
  alertWebhook: 'https://alerts.your-app.com/fraud'
});
```

## Sui Stack Components

### 1. Move Smart Contracts

```move
module aniki::treasury {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    public struct TreasuryConfig has key, store {
        id: UID,
        admin: address,
        cold_wallet: address,
        hot_wallet: address,
        cold_threshold: u64,
    }
    
    public fun initialize_treasury(
        admin: address,
        cold_wallet: address,
        hot_wallet: address,
        cold_threshold: u64,
        ctx: &mut TxContext
    ) {
        // Implementation details...
    }
}
```

### 2. SuiNS Integration

```typescript
// Human-readable addresses via SuiNS
const treasuryAddress = await aniki.resolveSuiNS('aniki-treasury.sui');
const agentAddress = await aniki.resolveSuiNS('agent-1.aniki.sui');
```

### 3. RPC Failover

```typescript
// Automatic failover between RPC endpoints
const client = aniki.getSuiClient({
  endpoints: [
    'https://fullnode.devnet.sui.io',
    'https://sui-devnet.nodereal.io',
    'https://sui-devnet-endpoint.blockvision.org'
  ],
  timeout: 5000,
  retries: 3
});
```

## Development Status

### Completed ✅
- Project setup and architecture design
- Basic Sui integration planning
- Security framework design
- README and documentation structure

### In Progress 🚧
- Sui Move smart contracts
- Air-gap wallet manager implementation
- Multi-signature coordinator
- Agent orchestrator adaptation

### Next Steps 📋
- Fraud detection engine
- SuiNS integration
- Demo application
- Testing and documentation

## Timeline (4 Days)

**Day 1 (Feb 7) - Setup & Architecture ✅**
- ✅ GitHub repo creation
- ✅ Project structure
- ✅ Sui Stack component planning
- ✅ Security framework design

**Day 2 (Feb 8) - Core Development**
- 🚧 Sui Move contracts
- 🚧 Air-gap wallet manager
- 🚧 Multi-sig coordinator
- 🚧 Basic agent orchestration

**Day 3 (Feb 9) - Integration & Features**
- ⏳ Fraud detection
- ⏳ SuiNS integration
- ⏳ RPC failover
- ⏳ Testing

**Day 4 (Feb 10-11) - Demo & Submission**
- ⏳ Working demo
- ⏳ Documentation completion
- ⏳ DeepSurge submission
- ⏳ Final testing

## Team & Resources

**Based on:** Butler project (autonomous agent treasury management)  
**Sui Resources:**
- [Sui Documentation](https://docs.sui.io)
- [OpenClaw Sui Skill](https://clawhub.ai/EasonC13/sui-move)
- [Sui Stack Plugin](https://github.com/0x-j/sui-stack-claude-code-plugin)

**Registration:** [DeepSurge Platform](https://www.deepsurge.xyz/create-account)

## Testing & Demos

### Running Demos

```bash
npm run demo            # Complete Aniki demo (includes janitor)
npm run demo:janitor    # Dedicated janitor service demo
npm run dev             # Development mode
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:coverage   # Coverage report
npm run test:watch      # Watch mode
```

### Test Categories
- Unit tests for core components
- Integration tests for Sui Stack
- Security tests for air-gap features
- End-to-end demo scenarios

**Target Coverage:** 80%+

## Contributing

This is a hackathon project with a tight deadline! Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Implement your feature
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/your-username/aniki/issues)
- 📧 **Hackathon Contact:** team@aniki-sui.dev

---

**Aniki v0.1.0** - OpenClaw Hackathon Entry  
**Deadline:** February 11, 2026, 23:00 PST  
**Prize:** $1,900 for Top 5 Projects

**BUILD FAST, BUILD SECURE, BUILD TO WIN! 🚀**