import { SuiClient, SuiClientOptions } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SecurityManager } from './security/SecurityManager';
import { AgentOrchestrator } from './core/AgentOrchestrator';
import { TreasuryManager } from './core/TreasuryManager';
import { SuiManager } from './sui/SuiManager';

export interface AnikiConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
  rpcEndpoints?: string[];
  securityLevel: 'low' | 'medium' | 'high';
  multiSig?: boolean;
  coldWalletThreshold?: number; // SUI amount threshold for cold wallet
  hotWalletThreshold?: number;  // SUI amount threshold for hot wallet
}

export interface SecurityConfig {
  coldWallet: string;
  hotWallet: string;
  threshold: {
    cold: number;  // Amount requiring cold wallet approval
    hot: number;   // Max amount for hot wallet
  };
  multiSigSigners?: string[];
  multiSigThreshold?: number;
}

export interface AgentTask {
  task: string;
  budget: number; // SUI units
  securityRequired?: boolean;
  approvalThreshold?: number;
  maxConcurrent?: number;
  retryOnFailure?: boolean;
}

export interface AgentResult {
  success: boolean;
  result?: any;
  error?: string;
  tokensUsed: number;
  suiSpent: number;
  securityLevel: string;
  transactionHashes?: string[];
}

export class Aniki {
  private config: AnikiConfig;
  private securityManager: SecurityManager;
  private agentOrchestrator: AgentOrchestrator;
  private treasuryManager: TreasuryManager;
  private suiManager: SuiManager;
  private initialized: boolean = false;

  constructor(config: AnikiConfig) {
    this.config = config;
    this.suiManager = new SuiManager(config);
    this.securityManager = new SecurityManager(config);
    this.treasuryManager = new TreasuryManager(this.suiManager, this.securityManager);
    this.agentOrchestrator = new AgentOrchestrator(this.treasuryManager, this.securityManager);
  }

  /**
   * Initialize Aniki with security configuration
   */
  async initializeSecure(securityConfig: SecurityConfig): Promise<void> {
    console.log('🔐 Initializing Aniki with security features...');
    
    try {
      // Initialize Sui connection
      await this.suiManager.initialize();
      
      // Setup security layer
      await this.securityManager.initialize(securityConfig);
      
      // Initialize treasury with security constraints
      await this.treasuryManager.initialize(securityConfig);
      
      // Setup agent orchestrator
      await this.agentOrchestrator.initialize();
      
      this.initialized = true;
      console.log('✅ Aniki initialized successfully');
      console.log(`🔗 Network: ${this.config.network}`);
      console.log(`🛡️ Security Level: ${this.config.securityLevel}`);
      console.log(`🏦 Cold Wallet: ${securityConfig.coldWallet.slice(0, 10)}...`);
      console.log(`💳 Hot Wallet: ${securityConfig.hotWallet.slice(0, 10)}...`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Aniki:', error);
      throw error;
    }
  }

  /**
   * Spawn a secure agent with treasury access
   */
  async spawnSecureAgent(task: AgentTask): Promise<AgentResult> {
    if (!this.initialized) {
      throw new Error('Aniki not initialized. Call initializeSecure() first.');
    }

    console.log(`🤖 Spawning secure agent for task: ${task.task}`);
    console.log(`💰 Budget: ${task.budget} SUI`);
    console.log(`🛡️ Security Required: ${task.securityRequired ? 'Yes' : 'No'}`);

    try {
      // Security check
      const securityCheck = await this.securityManager.assessTask(task);
      if (!securityCheck.approved) {
        throw new Error(`Security check failed: ${securityCheck.reason}`);
      }

      // Budget allocation and approval
      const allocation = await this.treasuryManager.allocateBudget(task.budget, task.securityRequired);
      
      // Execute agent task
      const result = await this.agentOrchestrator.executeTask(task, allocation);
      
      // Log completion
      console.log(`✅ Agent task completed successfully`);
      console.log(`📊 Tokens Used: ${result.tokensUsed}`);
      console.log(`💸 SUI Spent: ${result.suiSpent}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Agent task failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: 0,
        suiSpent: 0,
        securityLevel: this.config.securityLevel
      };
    }
  }

  /**
   * Get current status of Aniki system
   */
  async getStatus(): Promise<any> {
    if (!this.initialized) {
      return { initialized: false };
    }

    const suiStatus = await this.suiManager.getStatus();
    const treasuryStatus = await this.treasuryManager.getStatus();
    const securityStatus = await this.securityManager.getStatus();
    const agentStatus = this.agentOrchestrator.getStatus();

    return {
      initialized: true,
      timestamp: new Date().toISOString(),
      network: this.config.network,
      sui: suiStatus,
      treasury: treasuryStatus,
      security: securityStatus,
      agents: agentStatus
    };
  }

  /**
   * Emergency stop - halt all operations and secure funds
   */
  async emergencyStop(reason: string): Promise<void> {
    console.log(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
    
    try {
      // Stop all agents
      await this.agentOrchestrator.stopAllAgents();
      
      // Secure treasury
      await this.treasuryManager.emergencySecure();
      
      // Activate maximum security
      await this.securityManager.activateEmergencyMode();
      
      console.log('🛑 Emergency stop completed - all operations halted');
      
    } catch (error) {
      console.error('❌ Emergency stop failed:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction with security checks
   */
  async createTransaction(params: {
    amount: number;
    recipient: string;
    approvalMode?: 'hot' | 'cold' | 'multi-sig';
    memo?: string;
  }): Promise<any> {
    return this.treasuryManager.createSecureTransaction(params);
  }

  /**
   * Setup multi-signature configuration
   */
  async setupMultiSig(config: {
    signers: string[];
    threshold: number;
    minAmount: number;
  }): Promise<void> {
    return this.securityManager.setupMultiSig(config);
  }

  /**
   * Enable fraud detection with ML-based monitoring
   */
  enableFraudDetection(config: {
    maxDailyVolume: number;
    suspiciousPatterns: string[];
    alertWebhook?: string;
  }): void {
    this.securityManager.enableFraudDetection(config);
  }

  /**
   * Resolve SuiNS address to human-readable name
   */
  async resolveSuiNS(name: string): Promise<string> {
    return this.suiManager.resolveSuiNS(name);
  }

  /**
   * Get Sui client for direct blockchain interaction
   */
  getSuiClient(): SuiClient {
    return this.suiManager.getClient();
  }

  /**
   * Get current gas price and optimize for transactions
   */
  async getOptimalGasPrice(): Promise<number> {
    return this.suiManager.getOptimalGasPrice();
  }

  /**
   * Batch multiple transactions for cost efficiency
   */
  async batchTransactions(transactions: any[]): Promise<string[]> {
    return this.treasuryManager.batchTransactions(transactions);
  }

  /**
   * Check if system is ready for operations
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get system health metrics
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: any;
  }> {
    const status = await this.getStatus();
    
    // Health assessment logic
    const isHealthy = status.sui.connected && 
                     status.treasury.balance > 1000 && 
                     status.security.level === this.config.securityLevel;

    return {
      status: isHealthy ? 'healthy' : 'warning',
      metrics: status
    };
  }
}