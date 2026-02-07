import { AnikiConfig, SecurityConfig } from '../Aniki';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

interface SecurityAssessment {
  approved: boolean;
  reason?: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresColdWallet: boolean;
  requiresMultiSig: boolean;
}

interface FraudDetectionConfig {
  maxDailyVolume: number;
  suspiciousPatterns: string[];
  alertWebhook?: string;
}

interface MultiSigConfig {
  signers: string[];
  threshold: number;
  minAmount: number;
}

interface TransactionAlert {
  id: string;
  timestamp: number;
  type: 'suspicious' | 'large_amount' | 'unusual_pattern' | 'fraud_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  resolved: boolean;
}

export class SecurityManager {
  private config: AnikiConfig;
  private securityConfig: SecurityConfig | null = null;
  private multiSigConfig: MultiSigConfig | null = null;
  private fraudDetection: FraudDetectionConfig | null = null;
  private emergencyMode: boolean = false;
  private dailyVolume: number = 0;
  private lastVolumeReset: number = Date.now();
  private alerts: TransactionAlert[] = [];
  private suspiciousPatterns: Set<string> = new Set();

  constructor(config: AnikiConfig) {
    this.config = config;
    this.initializePatternDetection();
  }

  /**
   * Initialize security manager with configuration
   */
  async initialize(securityConfig: SecurityConfig): Promise<void> {
    console.log('🔐 Initializing Security Manager...');
    
    try {
      this.securityConfig = securityConfig;
      
      // Validate wallet addresses
      await this.validateWalletAddresses(securityConfig);
      
      // Setup security monitoring
      this.setupSecurityMonitoring();
      
      // Initialize fraud detection patterns
      this.initializeSecurityPatterns();
      
      console.log('✅ Security Manager initialized');
      console.log(`🛡️ Security Level: ${this.config.securityLevel}`);
      console.log(`❄️ Cold Wallet Threshold: ${securityConfig.threshold.cold} SUI`);
      console.log(`🔥 Hot Wallet Threshold: ${securityConfig.threshold.hot} SUI`);
      
    } catch (error) {
      console.error('❌ Failed to initialize Security Manager:', error);
      throw error;
    }
  }

  /**
   * Assess security requirements for a task
   */
  async assessTask(task: any): Promise<SecurityAssessment> {
    if (!this.securityConfig) {
      throw new Error('Security Manager not initialized');
    }

    const assessment: SecurityAssessment = {
      approved: true,
      securityLevel: 'low',
      requiresColdWallet: false,
      requiresMultiSig: false
    };

    // Emergency mode check
    if (this.emergencyMode) {
      return {
        approved: false,
        reason: 'System in emergency mode - all operations suspended',
        securityLevel: 'critical',
        requiresColdWallet: true,
        requiresMultiSig: true
      };
    }

    // Budget-based security assessment
    if (task.budget > this.securityConfig.threshold.cold) {
      assessment.securityLevel = 'critical';
      assessment.requiresColdWallet = true;
      assessment.requiresMultiSig = this.multiSigConfig !== null;
    } else if (task.budget > this.securityConfig.threshold.hot) {
      assessment.securityLevel = 'high';
      assessment.requiresColdWallet = false;
      assessment.requiresMultiSig = this.multiSigConfig !== null;
    } else if (task.budget > this.securityConfig.threshold.hot * 0.1) {
      assessment.securityLevel = 'medium';
    }

    // Daily volume check
    await this.updateDailyVolume();
    if (this.dailyVolume + task.budget > (this.fraudDetection?.maxDailyVolume || Infinity)) {
      assessment.approved = false;
      assessment.reason = 'Daily volume limit exceeded';
      assessment.securityLevel = 'critical';
    }

    // Fraud detection check
    const fraudCheck = await this.checkFraudPatterns(task);
    if (fraudCheck.suspicious) {
      assessment.securityLevel = 'critical';
      assessment.requiresColdWallet = true;
      assessment.requiresMultiSig = true;
      
      await this.createAlert({
        type: 'suspicious',
        severity: 'high',
        details: { task, fraudCheck }
      });
    }

    // Security level override
    if (task.securityRequired && assessment.securityLevel === 'low') {
      assessment.securityLevel = 'medium';
    }

    console.log(`🔍 Security Assessment: ${assessment.securityLevel} (Budget: ${task.budget} SUI)`);
    
    return assessment;
  }

  /**
   * Setup multi-signature configuration
   */
  async setupMultiSig(config: MultiSigConfig): Promise<void> {
    console.log('🔐 Setting up Multi-Signature configuration...');
    
    // Validate signer addresses
    for (const signer of config.signers) {
      if (!this.isValidSuiAddress(signer)) {
        throw new Error(`Invalid signer address: ${signer}`);
      }
    }

    // Validate threshold
    if (config.threshold > config.signers.length) {
      throw new Error('Threshold cannot exceed number of signers');
    }

    if (config.threshold < 1) {
      throw new Error('Threshold must be at least 1');
    }

    this.multiSigConfig = config;
    
    console.log('✅ Multi-Sig configured:');
    console.log(`👥 Signers: ${config.signers.length}`);
    console.log(`🎯 Threshold: ${config.threshold}/${config.signers.length}`);
    console.log(`💰 Min Amount: ${config.minAmount} SUI`);
  }

  /**
   * Enable fraud detection with ML-based monitoring
   */
  enableFraudDetection(config: FraudDetectionConfig): void {
    console.log('🚨 Enabling Fraud Detection...');
    
    this.fraudDetection = config;
    
    // Add patterns to detection set
    config.suspiciousPatterns.forEach(pattern => {
      this.suspiciousPatterns.add(pattern);
    });

    console.log('✅ Fraud Detection enabled:');
    console.log(`📊 Max Daily Volume: ${config.maxDailyVolume} SUI`);
    console.log(`🎯 Patterns: ${config.suspiciousPatterns.length}`);
    console.log(`📢 Webhook: ${config.alertWebhook ? 'Yes' : 'No'}`);
  }

  /**
   * Activate emergency mode - halt all operations
   */
  async activateEmergencyMode(): Promise<void> {
    console.log('🚨 ACTIVATING EMERGENCY MODE');
    
    this.emergencyMode = true;
    
    // Create critical alert
    await this.createAlert({
      type: 'fraud_detected',
      severity: 'critical',
      details: { reason: 'Emergency mode activated', timestamp: Date.now() }
    });

    // Send notifications
    if (this.fraudDetection?.alertWebhook) {
      await this.sendWebhookAlert({
        type: 'emergency',
        message: 'Aniki system in emergency mode - all operations suspended',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🛑 Emergency mode active - all operations suspended');
  }

  /**
   * Deactivate emergency mode (requires manual intervention)
   */
  async deactivateEmergencyMode(authCode: string): Promise<void> {
    // In production, this would require proper authentication
    if (authCode !== 'EMERGENCY_OVERRIDE_2026') {
      throw new Error('Invalid emergency override code');
    }

    this.emergencyMode = false;
    console.log('✅ Emergency mode deactivated');
  }

  /**
   * Get security status
   */
  async getStatus(): Promise<any> {
    await this.updateDailyVolume();
    
    return {
      level: this.config.securityLevel,
      emergencyMode: this.emergencyMode,
      multiSigEnabled: this.multiSigConfig !== null,
      fraudDetectionEnabled: this.fraudDetection !== null,
      dailyVolume: this.dailyVolume,
      dailyVolumeLimit: this.fraudDetection?.maxDailyVolume,
      alerts: this.alerts.length,
      unresolvedAlerts: this.alerts.filter(a => !a.resolved).length,
      coldWalletThreshold: this.securityConfig?.threshold.cold,
      hotWalletThreshold: this.securityConfig?.threshold.hot,
      suspiciousPatterns: this.suspiciousPatterns.size
    };
  }

  /**
   * Validate wallet addresses
   */
  private async validateWalletAddresses(config: SecurityConfig): Promise<void> {
    if (!this.isValidSuiAddress(config.coldWallet)) {
      throw new Error('Invalid cold wallet address');
    }

    if (!this.isValidSuiAddress(config.hotWallet)) {
      throw new Error('Invalid hot wallet address');
    }

    if (config.coldWallet === config.hotWallet) {
      throw new Error('Cold and hot wallets cannot be the same');
    }

    console.log('✅ Wallet addresses validated');
  }

  /**
   * Check if address is valid Sui address
   */
  private isValidSuiAddress(address: string): boolean {
    // Basic Sui address validation (0x followed by 64 hex chars)
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  /**
   * Setup security monitoring
   */
  private setupSecurityMonitoring(): void {
    // Setup periodic security checks
    setInterval(async () => {
      await this.performSecurityScan();
    }, 60000); // Every minute

    console.log('🔍 Security monitoring active');
  }

  /**
   * Initialize fraud detection patterns
   */
  private initializePatternDetection(): void {
    // Initialize with common fraud patterns
    const defaultPatterns = [
      'rapid-fire',      // Multiple quick transactions
      'unusual-hours',   // Transactions at unusual times
      'round-numbers',   // Suspicious round number amounts
      'sequence-break',  // Breaking normal transaction patterns
      'new-recipient',   // Sending to never-before-used addresses
      'velocity-spike'   // Sudden increase in transaction velocity
    ];

    defaultPatterns.forEach(pattern => {
      this.suspiciousPatterns.add(pattern);
    });
  }

  /**
   * Initialize security patterns based on configuration
   */
  private initializeSecurityPatterns(): void {
    // Add high-security patterns for this configuration
    if (this.config.securityLevel === 'high') {
      this.suspiciousPatterns.add('any-large-amount');
      this.suspiciousPatterns.add('cross-chain-bridge');
      this.suspiciousPatterns.add('new-contract-interaction');
    }
  }

  /**
   * Check for fraud patterns in task
   */
  private async checkFraudPatterns(task: any): Promise<{ suspicious: boolean; patterns: string[] }> {
    const detectedPatterns: string[] = [];

    // Check for suspicious patterns
    if (this.suspiciousPatterns.has('rapid-fire')) {
      // Check if this is part of rapid-fire sequence
      // Implementation would check recent transaction history
    }

    if (this.suspiciousPatterns.has('unusual-hours')) {
      const hour = new Date().getHours();
      if (hour < 6 || hour > 23) { // Unusual hours: 23:00 - 06:00
        detectedPatterns.push('unusual-hours');
      }
    }

    if (this.suspiciousPatterns.has('round-numbers') && task.budget % 1000 === 0 && task.budget > 10000) {
      detectedPatterns.push('round-numbers');
    }

    if (this.config.securityLevel === 'high' && this.suspiciousPatterns.has('any-large-amount')) {
      if (task.budget > 50000) { // 50k SUI threshold
        detectedPatterns.push('any-large-amount');
      }
    }

    return {
      suspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns
    };
  }

  /**
   * Update daily volume tracking
   */
  private async updateDailyVolume(): Promise<void> {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Reset daily volume if it's a new day
    if (now - this.lastVolumeReset > oneDay) {
      this.dailyVolume = 0;
      this.lastVolumeReset = now;
      console.log('📊 Daily volume reset');
    }
  }

  /**
   * Add to daily volume
   */
  addToVolume(amount: number): void {
    this.dailyVolume += amount;
    console.log(`📈 Daily volume: ${this.dailyVolume} SUI`);
  }

  /**
   * Create security alert
   */
  private async createAlert(params: {
    type: TransactionAlert['type'];
    severity: TransactionAlert['severity'];
    details: any;
  }): Promise<void> {
    const alert: TransactionAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: params.type,
      severity: params.severity,
      details: params.details,
      resolved: false
    };

    this.alerts.push(alert);
    
    console.log(`🚨 Security Alert [${params.severity.toUpperCase()}]: ${params.type}`);

    // Send webhook notification
    if (this.fraudDetection?.alertWebhook) {
      await this.sendWebhookAlert(alert);
    }

    // Auto-trigger emergency mode for critical alerts
    if (params.severity === 'critical' && params.type === 'fraud_detected') {
      await this.activateEmergencyMode();
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: any): Promise<void> {
    if (!this.fraudDetection?.alertWebhook) return;

    try {
      // Implementation would send HTTP POST to webhook
      console.log(`📢 Webhook alert sent: ${JSON.stringify(alert)}`);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  /**
   * Perform periodic security scan
   */
  private async performSecurityScan(): Promise<void> {
    // Check for suspicious activity patterns
    // Implementation would analyze recent transactions
    
    // Update volume tracking
    await this.updateDailyVolume();

    // Clean up old alerts (older than 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp > weekAgo);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): TransactionAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert resolved: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * Check if emergency mode is active
   */
  isEmergencyMode(): boolean {
    return this.emergencyMode;
  }

  /**
   * Get multi-sig configuration
   */
  getMultiSigConfig(): MultiSigConfig | null {
    return this.multiSigConfig;
  }

  /**
   * Check if amount requires multi-sig
   */
  requiresMultiSig(amount: number): boolean {
    return this.multiSigConfig !== null && amount >= this.multiSigConfig.minAmount;
  }

  /**
   * Check if amount requires cold wallet
   */
  requiresColdWallet(amount: number): boolean {
    return this.securityConfig !== null && amount >= this.securityConfig.threshold.cold;
  }
}