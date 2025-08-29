import { RawTransaction, SupportedChain, SupportedToken } from '../models/transaction';
import { v4 as uuidv4 } from 'uuid';

export class MockBlockchainService {
  private readonly chains: SupportedChain[] = ['ethereum', 'polygon', 'bsc', 'arbitrum', 'solana'];
  private readonly tokens: SupportedToken[] = ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI', 'LINK', 'UNI', 'AAVE', 'MATIC', 'BNB', 'ARB', 'SOL'];

  async getTransaction(transactionId: string): Promise<RawTransaction> {
    // Validate transaction ID format
    if (!this.isValidTransactionId(transactionId)) {
      throw new Error(`Invalid transaction ID format: ${transactionId}`);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // TODO: Replace with real blockchain API calls
    // This mock service should be replaced with actual blockchain clients:
    // - Web3.js for Ethereum, Polygon, BSC, Arbitrum
    // - @solana/web3.js for Solana
    // - Handle different RPC endpoints for each chain
    // - Implement proper error handling for network failures

    const fromChain = this.getRandomChain();
    let toChain = this.getRandomChain();
    while (toChain === fromChain) {
      toChain = this.getRandomChain();
    }

    const transaction: RawTransaction = {
      hash: transactionId,
      fromChain,
      toChain,
      token: this.getRandomToken(),
      amount: this.generateRandomAmount(),
      timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Last 7 days
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      fromAddress: this.generateRandomAddress(fromChain),
      toAddress: this.generateRandomAddress(toChain),
      gasUsed: Math.floor(Math.random() * 200000 + 21000).toString(),
      gasPrice: (Math.random() * 100 + 10).toFixed(9)
    };

    return transaction;
  }

  async getTransactionsByBlock(chain: SupportedChain, blockNumber: number): Promise<RawTransaction[]> {
    // TODO: Implement block-based transaction fetching
    // This should:
    // 1. Connect to chain-specific RPC endpoint
    // 2. Fetch all transactions in the block
    // 3. Filter for cross-chain transactions
    // 4. Parse transaction data according to chain format

    const transactionCount = Math.floor(Math.random() * 10) + 1;
    const transactions: RawTransaction[] = [];

    for (let i = 0; i < transactionCount; i++) {
      const txId = this.generateTransactionHash(chain);
      transactions.push(await this.getTransaction(txId));
    }

    return transactions;
  }

  private getRandomChain(): SupportedChain {
    return this.chains[Math.floor(Math.random() * this.chains.length)];
  }

  private getRandomToken(): SupportedToken {
    return this.tokens[Math.floor(Math.random() * this.tokens.length)];
  }

  private generateRandomAmount(): string {
    const amounts = [
      (Math.random() * 1000 + 1).toFixed(6),      // 1-1000
      (Math.random() * 10000 + 1000).toFixed(6),  // 1K-10K
      (Math.random() * 100000 + 10000).toFixed(6) // 10K-100K
    ];
    return amounts[Math.floor(Math.random() * amounts.length)];
  }

  private generateRandomAddress(chain: SupportedChain): string {
    if (chain === 'solana') {
      // Solana addresses are base58 encoded, ~44 characters
      return this.generateBase58Address();
    } else {
      // Ethereum-compatible addresses
      return '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
    }
  }

  private generateBase58Address(): string {
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    return Array.from({ length: 44 }, () => 
      base58Chars[Math.floor(Math.random() * base58Chars.length)]
    ).join('');
  }

  private generateTransactionHash(chain: SupportedChain): string {
    if (chain === 'solana') {
      return this.generateBase58Address();
    } else {
      return '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
    }
  }

  private isValidTransactionId(transactionId: string): boolean {
    // Allow basic validation - reject obviously invalid formats
    if (!transactionId || transactionId.length < 3) {
      return false;
    }
    
    // Reject clearly invalid patterns like 'invalid-tx-id'
    if (transactionId.includes('-') || transactionId.includes(' ')) {
      return false;
    }
    
    // Check for Ethereum-style transaction hash (0x + hex characters, flexible length for tests)
    const ethPattern = /^0x[a-fA-F0-9]+$/;
    
    // Check for Solana-style transaction signature (base58 characters)
    const solanaPattern = /^[1-9A-HJ-NP-Za-km-z]+$/;
    
    return ethPattern.test(transactionId) || solanaPattern.test(transactionId);
  }
}
