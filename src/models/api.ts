export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VolumeStatsQuery {
  from?: string;
  to?: string;
  period?: '1h' | '24h' | '7d' | '30d';
  token?: string;
}

export interface TransactionQuery {
  status?: 'pending' | 'completed' | 'failed';
  fromChain?: string;
  toChain?: string;
  token?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface TopTokensQuery {
  metric?: 'volume' | 'count' | 'avgAmount';
  period?: '24h' | '7d' | '30d';
  limit?: number;
  chains?: string[];
}

export interface VolumeStatsResponse {
  totalVolume: number;
  transactionCount: number;
  avgTransactionSize: number;
  topTokens: Array<{
    token: string;
    volume: number;
    percentage: number;
  }>;
  chainBreakdown: Array<{
    chain: string;
    volume: number;
    percentage: number;
  }>;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    mongodb: boolean;
    clickhouse: boolean;
    temporal: boolean;
  };
  uptime: number;
  version: string;
}
