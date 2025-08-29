import { SupportedToken } from '../models/transaction';

export class MockPriceService {
  private readonly tokenPrices: Record<SupportedToken, { basePrice: number; volatility: number }> = {
    'USDC': { basePrice: 1.0, volatility: 0.01 },
    'USDT': { basePrice: 1.0, volatility: 0.01 },
    'WETH': { basePrice: 2500, volatility: 0.05 },
    'WBTC': { basePrice: 45000, volatility: 0.04 },
    'DAI': { basePrice: 1.0, volatility: 0.02 },
    'LINK': { basePrice: 15, volatility: 0.06 },
    'UNI': { basePrice: 8, volatility: 0.07 },
    'AAVE': { basePrice: 120, volatility: 0.06 },
    'MATIC': { basePrice: 0.8, volatility: 0.08 },
    'BNB': { basePrice: 300, volatility: 0.05 },
    'ARB': { basePrice: 1.2, volatility: 0.09 },
    'SOL': { basePrice: 100, volatility: 0.07 }
  };

  async getTokenPrice(token: SupportedToken, timestamp?: number): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

    // TODO: Replace with real price API integration
    // Consider using:
    // - CoinGecko API: https://api.coingecko.com/api/v3/simple/price
    // - CoinMarketCap API
    // - DeFiPulse API for DeFi tokens
    // - Historical price endpoints for timestamp-based queries
    // - Implement caching to reduce API calls
    // - Handle rate limiting and API failures

    const priceInfo = this.tokenPrices[token];
    if (!priceInfo) {
      throw new Error(`Unsupported token: ${token}`);
    }

    // Generate realistic price fluctuation
    const timeVariation = timestamp ? this.getTimeBasedVariation(timestamp) : 1;
    const randomVariation = 1 + (Math.random() - 0.5) * priceInfo.volatility;
    
    return priceInfo.basePrice * timeVariation * randomVariation;
  }

  async getMultipleTokenPrices(tokens: SupportedToken[], timestamp?: number): Promise<Record<SupportedToken, number>> {
    // TODO: Implement batch price fetching
    // This should:
    // 1. Make single API call for multiple tokens
    // 2. Handle partial failures gracefully
    // 3. Implement proper caching strategy
    // 4. Return prices for all requested tokens

    const prices: Partial<Record<SupportedToken, number>> = {};
    
    // Simulate batch API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
    
    for (const token of tokens) {
      try {
        prices[token] = await this.getTokenPrice(token, timestamp);
      } catch (error) {
        console.warn(`Failed to get price for ${token}:`, error);
        // Continue with other tokens
      }
    }
    
    return prices as Record<SupportedToken, number>;
  }

  async getHistoricalPrice(token: SupportedToken, timestamp: number): Promise<number> {
    // TODO: Implement historical price fetching
    // This should:
    // 1. Query historical price APIs
    // 2. Handle different timestamp formats
    // 3. Interpolate prices for missing data points
    // 4. Cache historical data efficiently

    return this.getTokenPrice(token, timestamp);
  }

  private getTimeBasedVariation(timestamp: number): number {
    // Simulate price changes over time
    const now = Date.now();
    const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
    
    // Simulate gradual price changes over time
    const trendFactor = Math.sin(daysDiff * 0.1) * 0.1 + 1;
    return Math.max(0.1, trendFactor); // Ensure price doesn't go negative
  }

  async getPriceChange24h(token: SupportedToken): Promise<{ price: number; change24h: number; changePercent24h: number }> {
    // TODO: Implement 24h price change calculation
    // This should:
    // 1. Get current price
    // 2. Get price from 24h ago
    // 3. Calculate absolute and percentage changes
    // 4. Handle missing historical data

    const currentPrice = await this.getTokenPrice(token);
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const yesterdayPrice = await this.getTokenPrice(token, yesterday);
    
    const change24h = currentPrice - yesterdayPrice;
    const changePercent24h = (change24h / yesterdayPrice) * 100;
    
    return {
      price: currentPrice,
      change24h,
      changePercent24h
    };
  }
}
