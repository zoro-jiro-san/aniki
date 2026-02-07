import { SuiManager } from '../sui/SuiManager';
import { SecurityManager } from '../security/SecurityManager';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SecurityConfig } from '../Aniki';

interface TreasuryAllocation {
  id: string;
  amount: number;
  securityLevel: string;
  walletType: 'hot' | 'cold' | 'multi-sig';
  approved: boolean;
  approvalUrl?: string;
  transactionHash?: string;
  timestamp: number;
}

interface WalletConfig {
  address: string;
  keypair?: Ed25519Keypair;
  balance: number;
  lastChecked: number;
}

interface BatchTransaction {
  id: string;
  transactions: any[];
  totalAmount: number;
  estimatedGas: number;
  status: 'pending' | 'batched' | 'executed' | 'failed';
  batchHash?: string;
}

interface TreasuryMetrics {
  totalBalance: number;
  hotWalletBalance: number;
  coldWalletBalance: number;
  dailySpent: number;
  totalAllocated: number;
  pendingTransactions: number;
  gasOptimizationSavings: number;
}

export class TreasuryManager {
  private suiManager: SuiManager;
  private securityManager: SecurityManager;
  private hotWallet: WalletConfig | null = null;
  private coldWallet: WalletConfig | null = null;
  private allocations: Map<string, TreasuryAllocation> = new Map();
  private pendingBatches: Map<string, BatchTransaction> = new Map();
  private gasOptimization: boolean = true;
  private batchThreshold: number = 3; // Minimum transactions to batch
  private securityConfig: SecurityConfig | null = null;

  constructor(suiManager: SuiManager, securityManager: SecurityManager) {
    this.suiManager = suiManager;
    this.securityManager = securityManager;
  }

  /**
   * Initialize treasury with security configuration
   */
  async initialize(securityConfig: SecurityConfig): Promise<void> {
    console.log('🏦 Initializing Treasury Manager...');
    
    try {
      this.securityConfig = securityConfig;
      
      // Setup wallets
      await this.setupWallets(securityConfig);
      
      // Start balance monitoring
      this.startBalanceMonitoring();
      
      // Start gas optimization
      this.startGasOptimization();
      
      console.log('✅ Treasury Manager initialized');
      console.log(`💳 Hot Wallet: ${this.hotWallet?.address.slice(0, 10)}...`);
      console.log(`❄️ Cold Wallet: ${this.coldWallet?.address.slice(0, 10)}...`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Treasury Manager:', error);
      throw error;
    }
  }

  /**
   * Allocate budget for a task with security checks
   */
  async allocateBudget(amount: number, securityRequired?: boolean): Promise<TreasuryAllocation> {
    console.log(`💰 Allocating budget: ${amount} SUI`);
    
    // Security assessment
    const securityCheck = await this.securityManager.assessTask({
      budget: amount,
      securityRequired
    });

    if (!securityCheck.approved) {
      throw new Error(`Budget allocation denied: ${securityCheck.reason}`);
    }

    // Determine wallet type
    const walletType = this.determineWalletType(amount, securityCheck);
    
    // Check wallet balance
    await this.checkWalletBalance(walletType, amount);

    // Create allocation
    const allocation: TreasuryAllocation = {
      id: `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      securityLevel: securityCheck.securityLevel,
      walletType,
      approved: true,
      timestamp: Date.now()
    };

    // Handle cold wallet approval
    if (walletType === 'cold') {
      allocation.approved = false;
      allocation.approvalUrl = await this.createColdWalletApproval(allocation);
      console.log(`❄️ Cold wallet approval required: ${allocation.approvalUrl}`);
    }

    this.allocations.set(allocation.id, allocation);
    console.log(`✅ Budget allocated: ${allocation.id} (${walletType} wallet)`);
    
    return allocation;
  }

  /**
   * Create secure transaction with proper approval workflow
   */
  async createSecureTransaction(params: {
    amount: number;
    recipient: string;
    approvalMode?: 'hot' | 'cold' | 'multi-sig';
    memo?: string;
  }): Promise<any> {
    console.log(`💸 Creating secure transaction: ${params.amount} SUI -> ${params.recipient.slice(0, 10)}...`);

    // Security checks
    const requiresCold = this.securityManager.requiresColdWallet(params.amount);
    const requiresMultiSig = this.securityManager.requiresMultiSig(params.amount);

    if (this.securityManager.isEmergencyMode()) {
      throw new Error('Cannot create transactions in emergency mode');
    }

    // Determine approval mode
    let approvalMode = params.approvalMode;
    if (!approvalMode) {
      if (requiresMultiSig) {
        approvalMode = 'multi-sig';
      } else if (requiresCold) {
        approvalMode = 'cold';
      } else {
        approvalMode = 'hot';
      }
    }

    // Create transaction block
    const txBlock = new TransactionBlock();
    
    // Get appropriate wallet
    const wallet = approvalMode === 'hot' ? this.hotWallet : this.coldWallet;
    if (!wallet) {
      throw new Error(`${approvalMode} wallet not configured`);
    }

    // Add transfer to transaction block
    const [coin] = txBlock.splitCoins(txBlock.gas, [txBlock.pure(params.amount)]);
    txBlock.transferObjects([coin], txBlock.pure(params.recipient));

    // Add memo if provided
    if (params.memo) {
      // In a real implementation, this would be added to transaction metadata
      console.log(`📝 Transaction memo: ${params.memo}`);
    }

    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: params.amount,
      recipient: params.recipient,
      approvalMode,
      txBlock,
      wallet,
      status: 'pending',
      timestamp: Date.now(),
      requiresCold,
      requiresMultiSig
    };

    console.log(`📋 Transaction created: ${transaction.id} (${approvalMode})`);
    return transaction;
  }

  /**
   * Batch multiple transactions for gas optimization
   */
  async batchTransactions(transactions: any[]): Promise<string[]> {
    console.log(`📦 Batching ${transactions.length} transactions for gas optimization`);

    if (transactions.length < this.batchThreshold) {
      console.log(`⚠️ Transaction count below batch threshold (${this.batchThreshold}), executing individually`);
      return this.executeTransactionsIndividually(transactions);
    }

    // Group transactions by wallet type and recipient
    const batches = this.groupTransactionsForBatching(transactions);
    const results: string[] = [];

    for (const batch of batches) {
      try {
        const batchResult = await this.executeBatchedTransaction(batch);
        results.push(batchResult.digest);
        
        console.log(`✅ Batch executed: ${batchResult.digest}`);
        console.log(`💰 Total amount: ${batch.totalAmount} SUI`);
        console.log(`⛽ Gas saved: ~${this.estimateGasSavings(batch.transactions.length)} MIST`);
        
      } catch (error) {
        console.error(`❌ Batch execution failed:`, error);
        // Execute individually as fallback
        const fallbackResults = await this.executeTransactionsIndividually(batch.transactions);
        results.push(...fallbackResults);
      }
    }

    return results;
  }

  /**
   * Emergency secure - move all funds to cold storage
   */
  async emergencySecure(): Promise<void> {
    console.log('🚨 Emergency securing treasury funds...');

    try {
      if (!this.hotWallet || !this.coldWallet) {
        throw new Error('Wallets not configured for emergency secure');
      }

      // Get hot wallet balance
      const hotBalance = await this.suiManager.getBalance(this.hotWallet.address);
      
      if (hotBalance > 0) {
        console.log(`💰 Moving ${hotBalance} SUI from hot to cold wallet`);
        
        // Create emergency transfer
        const txBlock = new TransactionBlock();
        const [coin] = txBlock.splitCoins(txBlock.gas, [txBlock.pure(hotBalance)]);
        txBlock.transferObjects([coin], txBlock.pure(this.coldWallet.address));

        // Execute with hot wallet keypair
        if (this.hotWallet.keypair) {
          const result = await this.suiManager.executeTransaction(txBlock, this.hotWallet.keypair);
          console.log(`✅ Emergency transfer completed: ${result.digest}`);
        } else {
          console.warn('⚠️ Hot wallet keypair not available for emergency transfer');
        }
      }

      // Cancel all pending allocations
      for (const [id, allocation] of this.allocations) {
        if (!allocation.approved) {
          this.allocations.delete(id);
          console.log(`❌ Cancelled pending allocation: ${id}`);
        }
      }

      console.log('🛡️ Emergency securing completed');
      
    } catch (error) {
      console.error('❌ Emergency secure failed:', error);
      throw error;
    }
  }

  /**
   * Get treasury status and metrics
   */
  async getStatus(): Promise<TreasuryMetrics> {
    await this.updateBalances();

    const hotBalance = this.hotWallet?.balance || 0;
    const coldBalance = this.coldWallet?.balance || 0;
    const totalBalance = hotBalance + coldBalance;

    // Calculate daily spending
    const dailySpent = this.calculateDailySpending();
    
    // Calculate total allocated
    const totalAllocated = Array.from(this.allocations.values())
      .filter(a => a.approved)
      .reduce((sum, a) => sum + a.amount, 0);

    // Count pending transactions
    const pendingTransactions = Array.from(this.allocations.values())
      .filter(a => !a.approved).length;

    return {
      totalBalance,
      hotWalletBalance: hotBalance,
      coldWalletBalance: coldBalance,
      dailySpent,
      totalAllocated,
      pendingTransactions,
      gasOptimizationSavings: 0 // Would be calculated from actual gas savings
    };
  }

  /**
   * Setup hot and cold wallets
   */
  private async setupWallets(securityConfig: SecurityConfig): Promise<void> {
    // Setup hot wallet
    this.hotWallet = {
      address: securityConfig.hotWallet,
      balance: 0,
      lastChecked: 0
    };

    // Setup cold wallet
    this.coldWallet = {
      address: securityConfig.coldWallet,
      balance: 0,
      lastChecked: 0
    };

    // Update initial balances
    await this.updateBalances();
    
    console.log(`💳 Hot Wallet Balance: ${this.hotWallet.balance} SUI`);
    console.log(`❄️ Cold Wallet Balance: ${this.coldWallet.balance} SUI`);
  }

  /**
   * Update wallet balances
   */
  private async updateBalances(): Promise<void> {
    const now = Date.now();

    if (this.hotWallet && now - this.hotWallet.lastChecked > 60000) { // Update every minute
      try {
        this.hotWallet.balance = await this.suiManager.getBalance(this.hotWallet.address);
        this.hotWallet.lastChecked = now;
      } catch (error) {
        console.warn('Failed to update hot wallet balance:', error);
      }
    }

    if (this.coldWallet && now - this.coldWallet.lastChecked > 300000) { // Update every 5 minutes
      try {
        this.coldWallet.balance = await this.suiManager.getBalance(this.coldWallet.address);
        this.coldWallet.lastChecked = now;
      } catch (error) {
        console.warn('Failed to update cold wallet balance:', error);
      }
    }
  }

  /**
   * Determine appropriate wallet type for amount
   */
  private determineWalletType(amount: number, securityCheck: any): 'hot' | 'cold' | 'multi-sig' {
    if (securityCheck.requiresMultiSig) {
      return 'multi-sig';
    }
    
    if (securityCheck.requiresColdWallet) {
      return 'cold';
    }
    
    return 'hot';
  }

  /**
   * Check if wallet has sufficient balance
   */
  private async checkWalletBalance(walletType: string, amount: number): Promise<void> {
    await this.updateBalances();

    let availableBalance = 0;
    
    if (walletType === 'hot') {
      availableBalance = this.hotWallet?.balance || 0;
    } else if (walletType === 'cold') {
      availableBalance = this.coldWallet?.balance || 0;
    } else {
      // For multi-sig, check both wallets
      availableBalance = (this.hotWallet?.balance || 0) + (this.coldWallet?.balance || 0);
    }

    if (availableBalance < amount) {
      throw new Error(`Insufficient balance in ${walletType} wallet: ${availableBalance} < ${amount}`);
    }
  }

  /**
   * Create cold wallet approval workflow
   */
  private async createColdWalletApproval(allocation: TreasuryAllocation): Promise<string> {
    // In production, this would create a secure approval flow
    // For hackathon, we'll return a mock URL
    const approvalId = `approval_${allocation.id}`;
    return `https://aniki-treasury.sui/approve/${approvalId}`;
  }

  /**
   * Start balance monitoring
   */
  private startBalanceMonitoring(): void {
    setInterval(async () => {
      await this.updateBalances();
      await this.checkLowBalance();
    }, 300000); // Every 5 minutes

    console.log('📊 Balance monitoring started');
  }

  /**
   * Start gas optimization
   */
  private startGasOptimization(): void {
    if (!this.gasOptimization) return;

    setInterval(async () => {
      await this.optimizeGasUsage();
    }, 600000); // Every 10 minutes

    console.log('⛽ Gas optimization started');
  }

  /**
   * Check for low balance and alert
   */
  private async checkLowBalance(): Promise<void> {
    if (!this.securityConfig) return;

    const hotBalance = this.hotWallet?.balance || 0;
    const lowBalanceThreshold = this.securityConfig.threshold.hot * 0.2; // 20% of hot threshold

    if (hotBalance < lowBalanceThreshold) {
      console.warn(`⚠️ Hot wallet balance low: ${hotBalance} SUI (threshold: ${lowBalanceThreshold} SUI)`);
      
      // In production, this would trigger automatic rebalancing from cold wallet
      // or alert administrators
    }
  }

  /**
   * Optimize gas usage
   */
  private async optimizeGasUsage(): Promise<void> {
    // Implementation would analyze pending transactions and batch them
    // Check for batching opportunities
    const pendingTxs = Array.from(this.pendingBatches.values());
    
    for (const batch of pendingTxs) {
      if (batch.transactions.length >= this.batchThreshold) {
        console.log(`⛽ Gas optimization opportunity: ${batch.transactions.length} transactions`);
      }
    }
  }

  /**
   * Group transactions for efficient batching
   */
  private groupTransactionsForBatching(transactions: any[]): BatchTransaction[] {
    const batches: BatchTransaction[] = [];
    
    // Simple grouping by wallet type for now
    const hotTxs = transactions.filter(tx => tx.approvalMode === 'hot');
    const coldTxs = transactions.filter(tx => tx.approvalMode === 'cold');

    if (hotTxs.length > 0) {
      batches.push({
        id: `batch_hot_${Date.now()}`,
        transactions: hotTxs,
        totalAmount: hotTxs.reduce((sum, tx) => sum + tx.amount, 0),
        estimatedGas: this.estimateBatchGas(hotTxs.length),
        status: 'pending'
      });
    }

    if (coldTxs.length > 0) {
      batches.push({
        id: `batch_cold_${Date.now()}`,
        transactions: coldTxs,
        totalAmount: coldTxs.reduce((sum, tx) => sum + tx.amount, 0),
        estimatedGas: this.estimateBatchGas(coldTxs.length),
        status: 'pending'
      });
    }

    return batches;
  }

  /**
   * Execute a batched transaction
   */
  private async executeBatchedTransaction(batch: BatchTransaction): Promise<any> {
    // Implementation would combine multiple transactions into a single batch
    // For now, we'll simulate by executing the first transaction
    if (batch.transactions.length === 0) {
      throw new Error('Empty batch');
    }

    const firstTx = batch.transactions[0];
    return { digest: `batch_${batch.id}`, batch };
  }

  /**
   * Execute transactions individually
   */
  private async executeTransactionsIndividually(transactions: any[]): Promise<string[]> {
    const results: string[] = [];
    
    for (const tx of transactions) {
      try {
        // Simulate transaction execution
        const result = { digest: `individual_${tx.id}` };
        results.push(result.digest);
        console.log(`✅ Individual transaction: ${result.digest}`);
      } catch (error) {
        console.error(`❌ Transaction failed: ${tx.id}`, error);
      }
    }
    
    return results;
  }

  /**
   * Calculate daily spending
   */
  private calculateDailySpending(): number {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return Array.from(this.allocations.values())
      .filter(a => a.timestamp > oneDayAgo && a.approved)
      .reduce((sum, a) => sum + a.amount, 0);
  }

  /**
   * Estimate gas for batch transaction
   */
  private estimateBatchGas(txCount: number): number {
    // Simple estimation: base gas + per-transaction gas
    const baseGas = 1000;
    const perTxGas = 500;
    return baseGas + (txCount * perTxGas);
  }

  /**
   * Estimate gas savings from batching
   */
  private estimateGasSavings(txCount: number): number {
    const individualGas = txCount * 1500; // Individual tx gas
    const batchGas = this.estimateBatchGas(txCount);
    return individualGas - batchGas;
  }
}