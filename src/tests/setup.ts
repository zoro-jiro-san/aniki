// Global test setup for Aniki

// Mock console methods to reduce noise during testing
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Mock Sui SDK to avoid network calls during testing
jest.mock('@mysten/sui.js/client', () => ({
  SuiClient: jest.fn().mockImplementation(() => ({
    getLatestSuiSystemState: jest.fn().mockResolvedValue({
      referenceGasPrice: '1000'
    }),
    getBalance: jest.fn().mockResolvedValue({
      totalBalance: '100000000000'
    }),
    getAllCoins: jest.fn().mockResolvedValue({
      data: []
    }),
    signAndExecuteTransactionBlock: jest.fn().mockResolvedValue({
      digest: 'mock-digest-123'
    }),
    getTransactionBlock: jest.fn().mockResolvedValue({
      digest: 'mock-digest-123',
      effects: { status: { status: 'success' } }
    })
  }))
}));

jest.mock('@mysten/sui.js/keypairs/ed25519', () => ({
  Ed25519Keypair: jest.fn().mockImplementation(() => ({
    toSuiAddress: jest.fn().mockReturnValue('0x1234567890abcdef')
  }))
}));

jest.mock('@mysten/sui.js/transactions', () => ({
  TransactionBlock: jest.fn().mockImplementation(() => ({
    splitCoins: jest.fn(),
    transferObjects: jest.fn(),
    pure: jest.fn(),
    gas: 'mock-gas'
  }))
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SUI_NETWORK = 'devnet';
process.env.MOCK_TRANSACTIONS = 'true';