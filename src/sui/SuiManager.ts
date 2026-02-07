import { SuiClient, SuiClientOptions } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { AnikiConfig } from '../Aniki';

interface SuiEndpoint {
  url: string;
  name: string;
  healthy: boolean;
  latency: number;
  lastCheck: number;
}

export class SuiManager {
  private client: SuiClient | null = null;
  private config: AnikiConfig;
  private endpoints: SuiEndpoint[] = [];
  private currentEndpointIndex: number = 0;
  private failoverEnabled: boolean = true;

  constructor(config: AnikiConfig) {
    this.config = config;
    this.setupEndpoints();
  }

  /**
   * Setup RPC endpoints with failover support
   */
  private setupEndpoints(): void {
    const defaultEndpoints = {
      mainnet: [
        'https://fullnode.mainnet.sui.io:443',
        'https://sui-mainnet.nodereal.io',
        'https://sui-mainnet-endpoint.blockvision.org'
      ],
      testnet: [
        'https://fullnode.testnet.sui.io:443',
        'https://sui-testnet.nodereal.io',
        'https://sui-testnet-endpoint.blockvision.org'
      ],
      devnet: [
        'https://fullnode.devnet.sui.io:443',
        'https://sui-devnet.nodereal.io',
        'https://sui-devnet-endpoint.blockvision.org'
      ],
      localnet: ['http://127.0.0.1:9000']
    };

    const endpoints = this.config.rpcEndpoints || defaultEndpoints[this.config.network];
    
    this.endpoints = endpoints.map((url, index) => ({
      url,
      name: `${this.config.network}-${index + 1}`,
      healthy: true,
      latency: 0,
      lastCheck: 0
    }));

    console.log(`🔗 Configured ${this.endpoints.length} RPC endpoints for ${this.config.network}`);
  }

  /**
   * Initialize Sui client with failover support
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Sui connection...');
    
    try {
      await this.connectToHealthyEndpoint();
      await this.testConnection();
      console.log('✅ Sui connection established');
    } catch (error) {
      console.error('❌ Failed to initialize Sui connection:', error);
      throw error;
    }
  }

  /**
   * Connect to the first healthy endpoint
   */
  private async connectToHealthyEndpoint(): Promise<void> {
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      
      try {
        const startTime = Date.now();
        
        this.client = new SuiClient({
          url: endpoint.url,
        });

        // Test the connection
        await this.client.getLatestSuiSystemState();
        
        endpoint.latency = Date.now() - startTime;
        endpoint.healthy = true;
        endpoint.lastCheck = Date.now();
        this.currentEndpointIndex = i;
        
        console.log(`🌐 Connected to ${endpoint.name} (${endpoint.latency}ms)`);
        return;
        
      } catch (error) {
        endpoint.healthy = false;
        endpoint.lastCheck = Date.now();
        console.warn(`⚠️ Endpoint ${endpoint.name} unhealthy:`, error);
        continue;
      }
    }
    
    throw new Error('All Sui RPC endpoints are unhealthy');
  }

  /**
   * Test connection and get basic network info
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const systemState = await this.client.getLatestSuiSystemState();
      console.log(`📊 Connected to Sui ${this.config.network}`);
      console.log(`⛽ Reference gas price: ${systemState.referenceGasPrice}`);
      
    } catch (error) {
      throw new Error(`Connection test failed: ${error}`);
    }
  }

  /**
   * Get current Sui client (with auto-failover)
   */
  getClient(): SuiClient {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }
    return this.client;
  }

  /**
   * Health check all endpoints and failover if needed
   */
  async healthCheck(): Promise<void> {
    if (!this.failoverEnabled) return;

    const promises = this.endpoints.map(async (endpoint, index) => {
      try {
        const startTime = Date.now();
        const tempClient = new SuiClient({ url: endpoint.url });
        await tempClient.getLatestSuiSystemState();
        
        endpoint.latency = Date.now() - startTime;
        endpoint.healthy = true;
        endpoint.lastCheck = Date.now();
        
      } catch (error) {
        endpoint.healthy = false;
        endpoint.lastCheck = Date.now();
      }
    });

    await Promise.allSettled(promises);

    // If current endpoint is unhealthy, failover
    if (!this.endpoints[this.currentEndpointIndex].healthy) {
      console.warn('🚨 Current endpoint unhealthy, attempting failover...');
      await this.connectToHealthyEndpoint();
    }
  }

  /**
   * Get optimal gas price with caching
   */
  async getOptimalGasPrice(): Promise<number> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const systemState = await this.client.getLatestSuiSystemState();
      return parseInt(systemState.referenceGasPrice);
    } catch (error) {
      console.warn('Failed to get gas price, using default:', error);
      return 1000; // Default gas price
    }
  }

  /**
   * Resolve SuiNS name to address
   */
  async resolveSuiNS(name: string): Promise<string> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      // SuiNS resolution logic would go here
      // For hackathon, we'll simulate with a simple mapping
      const suinsMap: { [key: string]: string } = {
        'aniki-treasury.sui': '0x1234567890abcdef1234567890abcdef12345678',
        'agent-1.aniki.sui': '0xabcdef1234567890abcdef1234567890abcdef12'
      };

      const resolved = suinsMap[name];
      if (resolved) {
        console.log(`🏷️ Resolved ${name} -> ${resolved}`);
        return resolved;
      }

      throw new Error(`SuiNS name not found: ${name}`);
      
    } catch (error) {
      console.error('SuiNS resolution failed:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<number> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      });
      
      return parseInt(balance.totalBalance);
      
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get all coin objects for an address
   */
  async getAllCoins(address: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const result = await this.client.getAllCoins({
        owner: address
      });
      
      return result.data;
      
    } catch (error) {
      console.error('Failed to get coins:', error);
      throw error;
    }
  }

  /**
   * Execute transaction block
   */
  async executeTransaction(
    txBlock: TransactionBlock,
    keypair: Ed25519Keypair
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      const result = await this.client.signAndExecuteTransactionBlock({
        transactionBlock: txBlock,
        signer: keypair,
        requestType: 'WaitForLocalExecution',
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      console.log(`📝 Transaction executed: ${result.digest}`);
      return result;
      
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(digest: string): Promise<any> {
    if (!this.client) {
      throw new Error('Sui client not initialized');
    }

    try {
      return await this.client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showInput: true,
        },
      });
    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    const currentEndpoint = this.endpoints[this.currentEndpointIndex];
    
    return {
      connected: !!this.client,
      network: this.config.network,
      currentEndpoint: currentEndpoint?.name,
      endpointUrl: currentEndpoint?.url,
      latency: currentEndpoint?.latency,
      healthyEndpoints: this.endpoints.filter(e => e.healthy).length,
      totalEndpoints: this.endpoints.length,
      lastHealthCheck: Math.max(...this.endpoints.map(e => e.lastCheck)),
      failoverEnabled: this.failoverEnabled
    };
  }

  /**
   * Enable or disable automatic failover
   */
  setFailoverEnabled(enabled: boolean): void {
    this.failoverEnabled = enabled;
    console.log(`🔄 Failover ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get detailed endpoint health report
   */
  getEndpointHealth(): SuiEndpoint[] {
    return this.endpoints.map(endpoint => ({
      ...endpoint,
      lastCheckAgo: Date.now() - endpoint.lastCheck
    }));
  }

  /**
   * Force connection to specific endpoint (for testing)
   */
  async forceEndpoint(index: number): Promise<void> {
    if (index < 0 || index >= this.endpoints.length) {
      throw new Error(`Invalid endpoint index: ${index}`);
    }

    const endpoint = this.endpoints[index];
    
    try {
      this.client = new SuiClient({ url: endpoint.url });
      await this.testConnection();
      this.currentEndpointIndex = index;
      console.log(`🎯 Forced connection to ${endpoint.name}`);
    } catch (error) {
      throw new Error(`Failed to connect to ${endpoint.name}: ${error}`);
    }
  }
}