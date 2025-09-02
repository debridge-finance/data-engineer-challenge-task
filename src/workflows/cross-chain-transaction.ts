import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities';
import { RawTransaction, EnrichedTransaction } from '../models/transaction';

const {
  fetchBlockchainData,
  enrichWithPrices,
  saveToMongoDB,
  aggregateToClickHouse,
  validateTransaction,
  notifyProcessingComplete
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1s',
    maximumInterval: '30s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function processCrossChainTransaction(transactionId: string): Promise<EnrichedTransaction> {
  // TODO: Implement the main workflow logic
  // This workflow should:
  // 1. Fetch raw transaction data from blockchain
  // 2. Validate the transaction data
  // 3. Enrich with price data
  // 4. Save enriched data to MongoDB
  // 5. Aggregate metrics to ClickHouse
  // 6. Handle retries and error scenarios
  // 7. Send completion notification

  try {
    // Step 1: Fetch blockchain data
    const rawTransaction: RawTransaction = await fetchBlockchainData(transactionId);
    
    // Step 2: Validate transaction
    await validateTransaction(rawTransaction);
    
    // Step 3: Enrich with prices
    // TODO: Implement price enrichment logic
    const enrichedTransaction: EnrichedTransaction | null = await enrichWithPrices(rawTransaction);
    
    if (!enrichedTransaction) {
      throw new Error('Failed to enrich transaction');
    }
    
    // Step 4: Save to MongoDB
    // TODO: Implement MongoDB save operation
    await saveToMongoDB(enrichedTransaction);
    
    // Step 5: Aggregate to ClickHouse
    // TODO: Implement ClickHouse aggregation
    await aggregateToClickHouse(enrichedTransaction);
    
    // Step 6: Notify completion
    await notifyProcessingComplete(transactionId, 'completed');
    
    return enrichedTransaction;
    
  } catch (error) {
    // TODO: Implement proper error handling
    // Should handle different types of errors:
    // - Network timeouts
    // - Invalid transaction data
    // - Database connection issues
    // - Price service unavailable
    
    await notifyProcessingComplete(transactionId, 'failed');
    throw error;
  }
}

export async function batchProcessTransactions(transactionIds: string[]): Promise<void> {
  // TODO: Implement batch processing workflow
  // This workflow should:
  // 1. Process transactions in parallel (with concurrency limits)
  // 2. Handle partial failures gracefully
  // 3. Provide progress updates
  // 4. Generate batch processing report
  
  const batchSize = 10; // Process 10 transactions at a time
  
  for (let i = 0; i < transactionIds.length; i += batchSize) {
    const batch = transactionIds.slice(i, i + batchSize);
    
    // TODO: Process batch in parallel
    const promises = batch.map(id => processCrossChainTransaction(id));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      // TODO: Handle batch processing errors
      console.error(`Batch processing failed for batch starting at index ${i}:`, error);
    }
    
    // Small delay between batches to avoid overwhelming the system
    if (i + batchSize < transactionIds.length) {
      await sleep('1s');
    }
  }
}
