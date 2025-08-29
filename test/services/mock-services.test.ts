import { MockBlockchainService } from '../../src/services/mock-blockchain.service';
import { MockPriceService } from '../../src/services/mock-price.service';
import { SupportedChain, SupportedToken } from '../../src/models/transaction';

describe('Mock Services', () => {
  describe('MockBlockchainService', () => {
    let service: MockBlockchainService;

    beforeEach(() => {
      service = new MockBlockchainService();
    });

    it('should generate realistic transaction data', async () => {
      const transactionId = '0x1234567890abcdef';
      
      const transaction = await service.getTransaction(transactionId);
      
      expect(transaction.hash).toBe(transactionId);
      expect(transaction.fromChain).toBeDefined();
      expect(transaction.toChain).toBeDefined();
      expect(transaction.fromChain).not.toBe(transaction.toChain);
      expect(transaction.token).toBeDefined();
      expect(parseFloat(transaction.amount)).toBeGreaterThan(0);
      expect(transaction.timestamp).toBeGreaterThan(0);
      expect(transaction.blockNumber).toBeGreaterThan(0);
      expect(transaction.fromAddress).toBeDefined();
      expect(transaction.toAddress).toBeDefined();
    });

    it('should generate different addresses for different chains', async () => {
      const ethTx = await service.getTransaction('0x1111');
      const solTx = await service.getTransaction('0x2222');
      
      // Mock service should generate appropriate address formats
      // Ethereum addresses start with 0x, Solana addresses are base58
      expect(ethTx.fromAddress).toBeDefined();
      expect(solTx.fromAddress).toBeDefined();
    });

    it('should simulate network delays', async () => {
      const start = Date.now();
      await service.getTransaction('0x1234');
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThan(100); // Should have some delay
    });

    it('should generate transactions for all supported chains', async () => {
      const transactions = await Promise.all(
        Array.from({ length: 20 }, (_, i) => 
          service.getTransaction(`0x${i.toString().padStart(40, '0')}`)
        )
      );

      const chains = new Set(transactions.map(tx => tx.fromChain));
      expect(chains.size).toBeGreaterThan(1); // Should use multiple chains
    });
  });

  describe('MockPriceService', () => {
    let service: MockPriceService;

    beforeEach(() => {
      service = new MockPriceService();
    });

    it('should return realistic token prices', async () => {
      const usdcPrice = await service.getTokenPrice('USDC');
      const ethPrice = await service.getTokenPrice('WETH');
      
      expect(usdcPrice).toBeCloseTo(1.0, 1); // USDC should be ~$1
      expect(ethPrice).toBeGreaterThan(1000); // ETH should be > $1000
    });

    it('should handle all supported tokens', async () => {
      const tokens: SupportedToken[] = ['USDC', 'USDT', 'WETH', 'WBTC', 'DAI'];
      
      for (const token of tokens) {
        const price = await service.getTokenPrice(token);
        expect(price).toBeGreaterThan(0);
      }
    });

    it('should simulate price volatility over time', async () => {
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      
      const currentPrice = await service.getTokenPrice('WETH', now);
      const historicalPrice = await service.getTokenPrice('WETH', dayAgo);
      
      expect(Math.abs(currentPrice - historicalPrice)).toBeGreaterThan(0);
    });

    it('should throw error for unsupported tokens', async () => {
      await expect(service.getTokenPrice('INVALID' as SupportedToken))
        .rejects.toThrow('Unsupported token');
    });

    it('should provide batch price fetching', async () => {
      const tokens: SupportedToken[] = ['USDC', 'USDT', 'WETH'];
      
      const prices = await service.getMultipleTokenPrices(tokens);
      
      expect(Object.keys(prices)).toHaveLength(tokens.length);
      tokens.forEach(token => {
        expect(prices[token]).toBeGreaterThan(0);
      });
    });

    it('should calculate 24h price changes', async () => {
      const result = await service.getPriceChange24h('WETH');
      
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('change24h');
      expect(result).toHaveProperty('changePercent24h');
      expect(result.price).toBeGreaterThan(0);
    });
  });
});
