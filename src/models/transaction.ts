export interface RawTransaction {
  hash: string;
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  timestamp: number;
  blockNumber: number;
  fromAddress: string;
  toAddress: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface EnrichedTransaction extends RawTransaction {
  amountUSD: number;
  status: 'pending' | 'completed' | 'failed';
  processingTime?: number;
  tokenPrice: number;
  enrichedAt: number;
  retryCount?: number;
  errorMessage?: string;
}

export interface TransactionMetrics {
  transactionId: string;
  fromChain: string;
  toChain: string;
  token: string;
  amountUSD: number;
  processingTimeMs: number;
  timestamp: number;
  date: string; // YYYY-MM-DD format for ClickHouse
  hour: number; // 0-23 for hourly aggregations
}

export interface DailyStats {
  date: string;
  fromChain: string;
  toChain: string;
  totalVolume: number;
  transactionCount: number;
  avgProcessingTime: number;
  uniqueTokens: number;
}

export interface TokenVolume {
  token: string;
  totalVolume: number;
  transactionCount: number;
  avgAmount: number;
  chains: string[];
}

export interface ChainPairStats {
  fromChain: string;
  toChain: string;
  volume24h: number;
  transactionCount24h: number;
  avgProcessingTime: number;
  topTokens: string[];
}

export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type SupportedChain = 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'solana';
export type SupportedToken = 'USDC' | 'USDT' | 'WETH' | 'WBTC' | 'DAI' | 'LINK' | 'UNI' | 'AAVE' | 'MATIC' | 'BNB' | 'ARB' | 'SOL';
