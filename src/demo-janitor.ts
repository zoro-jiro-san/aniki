/**
 * Janitor Service Demo - Showcasing Memory Management and Optimization
 * 
 * This demo highlights the revolutionary Janitor Service that sets Aniki apart
 * from other treasury management systems. The janitor provides enterprise-grade
 * memory management, cache optimization, and performance monitoring.
 */

import { Aniki } from './Aniki';
import { JanitorService } from './core/JanitorService';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatBytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss
  };
}

async function demonstrateJanitorService() {
  colorLog(colors.cyan + colors.bright, '\n🧹 ANIKI JANITOR SERVICE DEMONSTRATION');
  colorLog(colors.white, '============================================\n');
  
  // Initialize Aniki with Janitor Service
  colorLog(colors.blue, '🔄 Initializing Aniki with Janitor Service...');
  const aniki = new Aniki({
    network: 'devnet',
    securityLevel: 'high',
    multiSig: true
  });

  // Initialize with security config
  await aniki.initializeSecure({
    coldWallet: '0x1234567890abcdef1234567890abcdef12345678',
    hotWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
    threshold: {
      cold: 100000,
      hot: 10000
    }
  });

  colorLog(colors.green, '✅ Aniki initialized with Janitor Service active\n');

  // Display initial memory state
  const initialMemory = getMemoryUsage();
  colorLog(colors.yellow, '📊 INITIAL SYSTEM STATE:');
  colorLog(colors.white, `💾 Memory Usage: ${formatBytes(initialMemory.heapUsed)} / ${formatBytes(initialMemory.heapTotal)}`);
  colorLog(colors.white, `🔄 RSS: ${formatBytes(initialMemory.rss)}`);
  console.log();

  // Simulate memory intensive operations
  colorLog(colors.blue, '⚡ SIMULATING HIGH-LOAD OPERATIONS...');
  const largeDataArray: any[] = [];
  
  for (let i = 0; i < 50; i++) {
    // Simulate token caching
    const tokenData = {
      id: `token_${i}`,
      balance: Math.random() * 1000000,
      metadata: {
        name: `Test Token ${i}`,
        symbol: `TT${i}`,
        description: 'Large test data structure'.repeat(100),
        properties: Array(1000).fill(0).map((_, j) => ({ key: `prop_${j}`, value: Math.random() }))
      }
    };
    
    largeDataArray.push(tokenData);
    await aniki.cacheTokens(`token_cache_${i}`, tokenData);
    
    if (i % 10 === 0) {
      colorLog(colors.white, `📦 Cached ${i + 1} token datasets...`);
    }
  }

  // Simulate agent sessions
  for (let i = 0; i < 25; i++) {
    await aniki.spawnSecureAgent({
      task: `Simulated task ${i}: Portfolio analysis and rebalancing`,
      budget: Math.random() * 50000,
      securityRequired: i % 3 === 0,
      approvalThreshold: 10000
    });
  }

  await sleep(1000);

  // Show memory usage after intensive operations
  const peakMemory = getMemoryUsage();
  colorLog(colors.red + colors.bright, '\n🚨 PEAK MEMORY USAGE (BEFORE JANITOR):');
  colorLog(colors.white, `💾 Memory Usage: ${formatBytes(peakMemory.heapUsed)} / ${formatBytes(peakMemory.heapTotal)}`);
  colorLog(colors.white, `📈 Memory Increase: +${formatBytes(peakMemory.heapUsed - initialMemory.heapUsed)}`);
  colorLog(colors.white, `🔄 RSS: ${formatBytes(peakMemory.rss)}`);

  // Show janitor status
  colorLog(colors.magenta + colors.bright, '\n🧹 JANITOR SERVICE STATUS:');
  const janitorStatus = aniki.getJanitorStatus();
  console.log(JSON.stringify(janitorStatus, null, 2));

  // Get optimization recommendations
  colorLog(colors.yellow, '\n💡 OPTIMIZATION RECOMMENDATIONS:');
  const recommendations = aniki.getOptimizationRecommendations();
  recommendations.forEach(rec => colorLog(colors.white, `   ${rec}`));

  await sleep(2000);

  // Demonstrate manual cleanup
  colorLog(colors.cyan + colors.bright, '\n🚀 PERFORMING INTELLIGENT MEMORY OPTIMIZATION...');
  const optimizationResult = await aniki.optimizeMemory();
  
  colorLog(colors.green, '✅ OPTIMIZATION COMPLETE!');
  colorLog(colors.white, `📊 Before: ${optimizationResult.before}`);
  colorLog(colors.white, `📊 After: ${optimizationResult.after}`);
  colorLog(colors.white, `💾 Freed: ${optimizationResult.freed}`);
  console.log();

  // Show updated recommendations
  if (optimizationResult.recommendations.length > 0) {
    colorLog(colors.yellow, '🎯 REMAINING RECOMMENDATIONS:');
    optimizationResult.recommendations.forEach(rec => colorLog(colors.white, `   ${rec}`));
  } else {
    colorLog(colors.green, '🎉 ALL OPTIMIZATION RECOMMENDATIONS ADDRESSED!');
  }

  // Demonstrate cache performance
  colorLog(colors.blue + colors.bright, '\n📈 CACHE PERFORMANCE DEMONSTRATION:');
  
  const cacheStartTime = Date.now();
  
  // Test cache hits
  for (let i = 0; i < 20; i++) {
    const cached = await aniki.getCachedTokens(`token_cache_${i}`);
    if (cached) {
      colorLog(colors.green, `✓ Cache HIT: token_cache_${i}`);
    } else {
      colorLog(colors.red, `✗ Cache MISS: token_cache_${i}`);
    }
  }
  
  const cacheEndTime = Date.now();
  colorLog(colors.cyan, `⚡ Cache lookup completed in ${cacheEndTime - cacheStartTime}ms`);

  // Show final cache statistics
  const cacheStats = aniki.getCacheStats();
  colorLog(colors.blue, '\n📊 FINAL CACHE STATISTICS:');
  console.log(JSON.stringify(cacheStats, null, 2));

  // Show system health
  const health = await aniki.getHealth();
  colorLog(colors.green + colors.bright, `\n💚 SYSTEM HEALTH: ${health.status.toUpperCase()}`);
  
  // Final memory comparison
  const finalMemory = getMemoryUsage();
  colorLog(colors.cyan + colors.bright, '\n📊 FINAL MEMORY COMPARISON:');
  colorLog(colors.white, `🏁 Initial: ${formatBytes(initialMemory.heapUsed)}`);
  colorLog(colors.white, `🔺 Peak: ${formatBytes(peakMemory.heapUsed)}`);
  colorLog(colors.white, `🎯 Final: ${formatBytes(finalMemory.heapUsed)}`);
  colorLog(colors.green, `💾 Net Reduction: ${formatBytes(peakMemory.heapUsed - finalMemory.heapUsed)}`);
  
  // Performance summary
  colorLog(colors.magenta + colors.bright, '\n🏆 JANITOR SERVICE IMPACT SUMMARY:');
  colorLog(colors.white, `   • Memory optimization: ${((peakMemory.heapUsed - finalMemory.heapUsed) / peakMemory.heapUsed * 100).toFixed(1)}% reduction`);
  colorLog(colors.white, `   • Cache performance: ${cacheStats.tokenCache.hitRate * 100}% hit rate`);
  colorLog(colors.white, `   • System status: ${health.status}`);
  colorLog(colors.white, `   • Resource management: Fully automated`);
  colorLog(colors.white, `   • Production readiness: Enterprise-grade`);

  console.log();
  colorLog(colors.green + colors.bright, '🎉 DEMONSTRATION COMPLETE!');
  colorLog(colors.cyan, 'The Janitor Service ensures Aniki maintains peak performance');
  colorLog(colors.cyan, 'under any workload - a key differentiator for enterprise adoption.\n');
}

async function main() {
  try {
    await demonstrateJanitorService();
  } catch (error) {
    colorLog(colors.red, '❌ Demo failed:');
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  colorLog(colors.yellow, '\n⚠️  Demo interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  colorLog(colors.red, '❌ Uncaught exception:');
  console.error(error);
  process.exit(1);
});

// Run the demo
if (require.main === module) {
  main();
}

export { demonstrateJanitorService };