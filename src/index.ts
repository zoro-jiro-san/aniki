export { Aniki } from './Aniki';
export { SuiManager } from './sui/SuiManager';
export { SecurityManager } from './security/SecurityManager';
export { TreasuryManager } from './core/TreasuryManager';
export { AgentOrchestrator } from './core/AgentOrchestrator';

// Types
export type { AnikiConfig, SecurityConfig, AgentTask, AgentResult } from './Aniki';

// Version
export const VERSION = '0.1.0';

// Default configurations
export const DEFAULT_CONFIG = {
  network: 'devnet' as const,
  securityLevel: 'high' as const,
  multiSig: true,
  coldWalletThreshold: 100000, // 100k SUI
  hotWalletThreshold: 10000    // 10k SUI
};

export const NETWORK_CONFIGS = {
  mainnet: {
    rpcEndpoints: [
      'https://fullnode.mainnet.sui.io:443',
      'https://sui-mainnet.nodereal.io',
      'https://sui-mainnet-endpoint.blockvision.org'
    ]
  },
  testnet: {
    rpcEndpoints: [
      'https://fullnode.testnet.sui.io:443',
      'https://sui-testnet.nodereal.io',
      'https://sui-testnet-endpoint.blockvision.org'
    ]
  },
  devnet: {
    rpcEndpoints: [
      'https://fullnode.devnet.sui.io:443',
      'https://sui-devnet.nodereal.io',
      'https://sui-devnet-endpoint.blockvision.org'
    ]
  },
  localnet: {
    rpcEndpoints: ['http://127.0.0.1:9000']
  }
};

/**
 * Quick start function for easy initialization
 */
export function createAniki(config?: Partial<AnikiConfig>) {
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };

  return new Aniki(finalConfig);
}

/**
 * Utility function to create security config
 */
export function createSecurityConfig(
  coldWallet: string,
  hotWallet: string,
  options?: {
    coldThreshold?: number;
    hotThreshold?: number;
    multiSigSigners?: string[];
    multiSigThreshold?: number;
  }
): SecurityConfig {
  return {
    coldWallet,
    hotWallet,
    threshold: {
      cold: options?.coldThreshold || 100000,
      hot: options?.hotThreshold || 10000
    },
    multiSigSigners: options?.multiSigSigners,
    multiSigThreshold: options?.multiSigThreshold
  };
}

/**
 * Utility function to validate Sui address
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Utility function to format SUI amount
 */
export function formatSuiAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M SUI`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K SUI`;
  } else {
    return `${amount} SUI`;
  }
}