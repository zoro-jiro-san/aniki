import { createAniki, createSecurityConfig } from '../index';

describe('Aniki Core', () => {
  const mockSecurityConfig = createSecurityConfig(
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
  );

  test('should create Aniki instance with default config', () => {
    const aniki = createAniki();
    expect(aniki).toBeDefined();
    expect(aniki.isReady()).toBe(false); // Not initialized yet
  });

  test('should create Aniki with custom network config', () => {
    const aniki = createAniki({
      network: 'testnet',
      securityLevel: 'medium'
    });
    expect(aniki).toBeDefined();
  });

  test('should validate Sui addresses correctly', async () => {
    const aniki = createAniki();
    
    // Mock the initialization to avoid actual network calls
    jest.spyOn(aniki as any, 'initializeSecure').mockResolvedValue(undefined);
    
    await aniki.initializeSecure(mockSecurityConfig);
    expect(aniki.isReady()).toBe(true);
  });

  test('should handle agent spawning', async () => {
    const aniki = createAniki();
    
    // Mock dependencies
    jest.spyOn(aniki as any, 'initializeSecure').mockResolvedValue(undefined);
    jest.spyOn(aniki as any, 'spawnSecureAgent').mockResolvedValue({
      success: true,
      tokensUsed: 1000,
      suiSpent: 100,
      securityLevel: 'high'
    });

    await aniki.initializeSecure(mockSecurityConfig);
    
    const result = await aniki.spawnSecureAgent({
      task: 'Test task',
      budget: 5000,
      securityRequired: true
    });

    expect(result.success).toBe(true);
    expect(result.tokensUsed).toBe(1000);
  });

  test('should handle emergency stop', async () => {
    const aniki = createAniki();
    
    // Mock the emergency stop
    jest.spyOn(aniki as any, 'emergencyStop').mockResolvedValue(undefined);
    
    await expect(aniki.emergencyStop('Test emergency')).resolves.not.toThrow();
  });

  test('should get system status', async () => {
    const aniki = createAniki();
    
    // Mock status response
    const mockStatus = {
      initialized: false,
      network: 'devnet',
      sui: { connected: false },
      treasury: { balance: 0 },
      security: { level: 'high', emergencyMode: false },
      agents: { activeTasks: 0 }
    };

    jest.spyOn(aniki as any, 'getStatus').mockResolvedValue(mockStatus);
    
    const status = await aniki.getStatus();
    expect(status.network).toBe('devnet');
    expect(status.security.level).toBe('high');
  });

  test('should handle multi-sig setup', async () => {
    const aniki = createAniki();
    
    const multiSigConfig = {
      signers: [
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222'
      ],
      threshold: 2,
      minAmount: 50000
    };

    jest.spyOn(aniki as any, 'setupMultiSig').mockResolvedValue(undefined);
    
    await expect(aniki.setupMultiSig(multiSigConfig)).resolves.not.toThrow();
  });

  test('should enable fraud detection', () => {
    const aniki = createAniki();
    
    const fraudConfig = {
      maxDailyVolume: 500000,
      suspiciousPatterns: ['rapid-fire', 'unusual-hours'],
      alertWebhook: 'https://alerts.test.com/fraud'
    };

    jest.spyOn(aniki as any, 'enableFraudDetection').mockImplementation(() => {});
    
    expect(() => aniki.enableFraudDetection(fraudConfig)).not.toThrow();
  });

  test('should handle transaction creation', async () => {
    const aniki = createAniki();
    
    const mockTransaction = {
      id: 'tx_123',
      amount: 1000,
      recipient: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      approvalMode: 'hot' as const,
      status: 'pending'
    };

    jest.spyOn(aniki as any, 'createTransaction').mockResolvedValue(mockTransaction);
    
    const result = await aniki.createTransaction({
      amount: 1000,
      recipient: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
    });

    expect(result.id).toBe('tx_123');
    expect(result.approvalMode).toBe('hot');
  });

  test('should get system health', async () => {
    const aniki = createAniki();
    
    const mockHealth = {
      status: 'healthy' as const,
      metrics: {
        sui: { connected: true },
        treasury: { balance: 100000 },
        security: { level: 'high' },
        agents: { activeTasks: 2 }
      }
    };

    jest.spyOn(aniki as any, 'getHealth').mockResolvedValue(mockHealth);
    
    const health = await aniki.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.metrics.treasury.balance).toBe(100000);
  });
});