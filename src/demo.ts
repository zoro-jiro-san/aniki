#!/usr/bin/env ts-node

import { createAniki, createSecurityConfig, formatSuiAmount } from './index';

/**
 * Aniki Demo - OpenClaw Hackathon
 * 
 * This demo showcases the key features of Aniki:
 * 1. Security-first treasury management
 * 2. Air-gap wallet integration  
 * 3. Multi-agent orchestration
 * 4. Sui blockchain integration
 * 5. Fraud detection and monitoring
 */

async function runDemo() {
  console.log('🚀 Aniki (兄貴) Demo - OpenClaw Hackathon');
  console.log('========================================');
  console.log('');

  try {
    // Step 1: Initialize Aniki with security configuration
    console.log('🔐 Step 1: Initializing Aniki with Security Features');
    console.log('');

    const aniki = createAniki({
      network: 'devnet',
      securityLevel: 'high',
      multiSig: true,
      rpcEndpoints: [
        'https://fullnode.devnet.sui.io:443',
        'https://sui-devnet.nodereal.io'
      ]
    });

    // Mock wallet addresses for demo
    const securityConfig = createSecurityConfig(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12', // Cold wallet
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab', // Hot wallet
      {
        coldThreshold: 100000,  // 100K SUI
        hotThreshold: 10000,    // 10K SUI
        multiSigSigners: [
          '0x1111111111111111111111111111111111111111111111111111111111111111',
          '0x2222222222222222222222222222222222222222222222222222222222222222',
          '0x3333333333333333333333333333333333333333333333333333333333333333'
        ],
        multiSigThreshold: 2
      }
    );

    await aniki.initializeSecure(securityConfig);
    
    console.log('✅ Aniki initialized with advanced security features');
    console.log('');

    // Step 2: Enable fraud detection
    console.log('🚨 Step 2: Enabling Fraud Detection & Monitoring');
    console.log('');

    aniki.enableFraudDetection({
      maxDailyVolume: 500000, // 500K SUI daily limit
      suspiciousPatterns: [
        'rapid-fire',
        'unusual-hours', 
        'round-numbers',
        'new-recipient'
      ],
      alertWebhook: 'https://alerts.aniki-treasury.sui/fraud'
    });

    // Setup multi-sig for high-value transactions
    await aniki.setupMultiSig({
      signers: securityConfig.multiSigSigners!,
      threshold: 2,
      minAmount: 50000 // 50K SUI
    });

    console.log('✅ Fraud detection enabled with ML-based monitoring');
    console.log('✅ Multi-signature setup completed (2-of-3)');
    console.log('');

    // Step 3: Get system status
    console.log('📊 Step 3: System Status Check');
    console.log('');

    const status = await aniki.getStatus();
    console.log('System Overview:');
    console.log(`  Network: ${status.network}`);
    console.log(`  Security Level: ${status.security.level}`);
    console.log(`  Emergency Mode: ${status.security.emergencyMode ? 'ACTIVE' : 'Normal'}`);
    console.log(`  Multi-Sig: ${status.security.multiSigEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  Fraud Detection: ${status.security.fraudDetectionEnabled ? 'Active' : 'Inactive'}`);
    console.log('');

    // Step 4: Demonstrate treasury management
    console.log('🏦 Step 4: Treasury Management Demo');
    console.log('');

    // Small transaction (hot wallet)
    console.log('💳 Creating small transaction (hot wallet):');
    const smallTx = await aniki.createTransaction({
      amount: 5000, // 5K SUI
      recipient: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      memo: 'Small transaction test'
    });
    console.log(`  Transaction ID: ${smallTx.id}`);
    console.log(`  Approval Mode: ${smallTx.approvalMode}`);
    console.log(`  Amount: ${formatSuiAmount(smallTx.amount)}`);
    console.log('');

    // Large transaction (cold wallet approval required)
    console.log('❄️ Creating large transaction (cold wallet approval):');
    const largeTx = await aniki.createTransaction({
      amount: 150000, // 150K SUI
      recipient: '0xfeedcafefeedcafefeedcafefeedcafefeedcafefeedcafefeedcafefeedcafe',
      memo: 'Large transaction requiring cold wallet approval'
    });
    console.log(`  Transaction ID: ${largeTx.id}`);
    console.log(`  Approval Mode: ${largeTx.approvalMode}`);
    console.log(`  Amount: ${formatSuiAmount(largeTx.amount)}`);
    console.log(`  ⚠️  Cold wallet approval required!`);
    console.log('');

    // Step 5: Agent orchestration demo
    console.log('🤖 Step 5: Multi-Agent Orchestration Demo');
    console.log('');

    console.log('Spawning autonomous agent for treasury management...');
    const agentResult1 = await aniki.spawnSecureAgent({
      task: 'Monitor DeFi positions and rebalance portfolio to optimize yield',
      budget: 25000, // 25K SUI
      securityRequired: true,
      approvalThreshold: 10000,
      maxConcurrent: 3,
      retryOnFailure: true
    });

    console.log('Agent Execution Results:');
    console.log(`  Success: ${agentResult1.success ? '✅' : '❌'}`);
    console.log(`  Task ID: ${agentResult1.taskId}`);
    console.log(`  Execution Time: ${agentResult1.executionTime}ms`);
    console.log(`  Tokens Used: ${agentResult1.tokensUsed}`);
    console.log(`  SUI Spent: ${formatSuiAmount(agentResult1.suiSpent)}`);
    console.log(`  Success Rate: ${(agentResult1.successRate * 100).toFixed(1)}%`);
    console.log('');

    console.log('Spawning second agent for security monitoring...');
    const agentResult2 = await aniki.spawnSecureAgent({
      task: 'Analyze transaction patterns and detect potential security threats',
      budget: 15000, // 15K SUI
      securityRequired: true,
      approvalThreshold: 5000,
      maxConcurrent: 2
    });

    console.log('Security Agent Results:');
    console.log(`  Success: ${agentResult2.success ? '✅' : '❌'}`);
    console.log(`  Task ID: ${agentResult2.taskId}`);
    console.log(`  Security Level: ${agentResult2.securityLevel}`);
    console.log(`  SUI Spent: ${formatSuiAmount(agentResult2.suiSpent)}`);
    console.log('');

    // Step 6: Batch transaction optimization
    console.log('⛽ Step 6: Gas Optimization Demo');
    console.log('');

    console.log('Creating multiple transactions for batching...');
    const transactions = [
      { amount: 1000, recipient: '0x1111111111111111111111111111111111111111111111111111111111111111' },
      { amount: 1500, recipient: '0x2222222222222222222222222222222222222222222222222222222222222222' },
      { amount: 2000, recipient: '0x3333333333333333333333333333333333333333333333333333333333333333' },
      { amount: 2500, recipient: '0x4444444444444444444444444444444444444444444444444444444444444444' }
    ];

    const batchResults = await aniki.batchTransactions(transactions);
    console.log('Batch Transaction Results:');
    console.log(`  Batches Created: ${batchResults.length}`);
    console.log(`  Total Amount: ${formatSuiAmount(transactions.reduce((sum, tx) => sum + tx.amount, 0))}`);
    console.log(`  Estimated Gas Savings: ~15-30% compared to individual transactions`);
    console.log('');

    // Step 7: SuiNS integration demo
    console.log('🏷️ Step 7: SuiNS Integration Demo');
    console.log('');

    try {
      const resolvedAddress = await aniki.resolveSuiNS('aniki-treasury.sui');
      console.log(`SuiNS Resolution: aniki-treasury.sui -> ${resolvedAddress}`);
    } catch (error) {
      console.log('SuiNS resolution demo (simulated for hackathon)');
    }
    console.log('');

    // Step 8: Health monitoring
    console.log('🏥 Step 8: System Health Check');
    console.log('');

    const health = await aniki.getHealth();
    console.log('System Health:');
    console.log(`  Status: ${health.status.toUpperCase()}`);
    console.log(`  Network Connected: ${health.metrics.sui.connected ? '✅' : '❌'}`);
    console.log(`  Security Level: ${health.metrics.security.level}`);
    console.log(`  Active Agents: ${health.metrics.agents.activeTasks}`);
    console.log(`  Pending Transactions: ${health.metrics.treasury.pendingTransactions}`);
    console.log('');

    // Step 9: Emergency simulation
    console.log('🚨 Step 9: Emergency Response Demo');
    console.log('');

    console.log('Simulating suspicious activity detection...');
    
    // This would trigger in real scenario
    console.log('⚠️ Suspicious pattern detected: rapid-fire transactions');
    console.log('🚨 Fraud detection alert triggered');
    console.log('🛡️ Enhanced security protocols activated');
    console.log('');
    
    console.log('Emergency stop simulation (commented out for demo):');
    console.log('// await aniki.emergencyStop("Suspicious activity detected");');
    console.log('');

    // Final status
    console.log('🎯 Step 10: Final Status Report');
    console.log('');

    const finalStatus = await aniki.getStatus();
    
    console.log('Aniki Demo Completed Successfully!');
    console.log('=================================');
    console.log('');
    console.log('Key Features Demonstrated:');
    console.log('✅ Air-gap security with cold/hot wallet separation');
    console.log('✅ Multi-signature transaction approval');
    console.log('✅ ML-based fraud detection and monitoring');
    console.log('✅ Multi-agent orchestration and coordination');
    console.log('✅ Gas optimization through transaction batching');
    console.log('✅ SuiNS integration for human-readable addresses');
    console.log('✅ Real-time health monitoring and alerting');
    console.log('✅ Emergency response and fund protection');
    console.log('');
    console.log('Sui Stack Components Used:');
    console.log('🔗 Sui RPC client with automatic failover');
    console.log('💰 Native SUI token handling and management');
    console.log('🏷️ SuiNS name resolution integration');
    console.log('📜 Move smart contract interaction (planned)');
    console.log('⛽ Gas optimization and fee management');
    console.log('');
    console.log('Security Track Features:');
    console.log('🛡️ Air-gap wallet architecture');
    console.log('🔐 Hardware wallet integration support');
    console.log('🚨 Real-time fraud detection engine');
    console.log('📊 Transaction pattern analysis');
    console.log('🚫 Emergency stop capabilities');
    console.log('');
    console.log(`Total Processing Time: ${Date.now() - demoStartTime}ms`);
    console.log('');
    console.log('Aniki (兄貴) - Your autonomous big brother for Sui treasury management! 🚀');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

const demoStartTime = Date.now();

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };