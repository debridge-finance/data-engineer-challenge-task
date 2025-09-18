# DBR | Take Home Task

# Test Assignment: Data Engineer at deBridge

## Job Description

Develop a system to collect and analyze blockchain data using a modern technology stack. The task tests skills in blockchain data, asynchronous programming, big data processing and building reliable distributed systems.

## 📋 Requirements

### 1. Data Collection

Collect a **minimum of 5000** USDC `Transfer` token **events** for the address:

- **Адрес**: `0xef4fb24ad0916217251f553c0596f8edc630eb66`
- **Network**: Ethereum Mainnet
- **USDC Contract**: `0xA0b86991c6218b36b36c1d19D4a2e9Eb0cE3606eB48`

**Technical Requirements:**

- Use the Ethereum JSON-RPC API
- Decode events via ERC20 ABI contract
- Handle retrays and rate limits

### 2. data analysis

Calculate gas statistics for the collected transactions:

### (a) Moving average (7 days)

Calculate moving average of gas price with a window of 7 days

### b) Aggregate total gas consumption by day

Aggregate total gas consumption (gas price × gas used) by calendar day

### c) Cumulative sum

Plot the cumulative sum of gas consumption on a time scale

### 3. data storage

Load the processed data into DBMS using:

- SQL with windowing functions for analytical queries
- Indexing by timestamps and addresses
- Optimization for time-series data

## 🛠 Technical Stack

### Required technologies:

- **Language**: TypeScript/JavaScript
- **Blockchain Library**: [viem](https://viem.sh/) for RPC calls
- **Orchestration**: [Temporal](https://temporal.io/) for workflow management
- **Database**: PostgreSQL, MongoDB or ClickHouse

### Recommended technologies:

- **ClickHouse** for time-series data (bonus points)
- **Docker** for containerization

## 📊 Output data format

Export the output to a JSON file in the following format:

```json
{
  "metadata": {
    "totalEvents": 5000,
    "dateRange": {
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    },
    "processingTime": "120s"
  },
  "events": [
    {
      "txHash": "0x123...",
      "blockNumber": 18500000,
      "timestamp": "2024-01-15T10:30:00Z",
      "from": "0xabc...",
      "to": "0xef4fb24ad0916217251f553c0596f8edc630eb66",
      "amount": "1000000000",
      "gasPrice": "30000000000",
      "gasUsed": "65000"
    }
  ],
  "gasStats": {
    "slidingAvg": [
      {"date": "2024-01-15", "avgGasPrice": "25.5"},
      {"date": "2024-01-16", "avgGasPrice": "27.3"}
    ],
    "sumByDate": {
      "2024-01-15": "1500000000000000",
      "2024-01-16": "1800000000000000"
    },
    "cumulativeSum": [
      {"date": "2024-01-15", "total": "1500000000000000"},
      {"date": "2024-01-16", "total": "3300000000000000"}
    ]
  }
}
```

## ✅ Evaluation Criteria

### Mandatory requirements:

1. ✅ **Workability** - the code must execute successfully and generate a correct result
2. ✅ **Documentation** - README with installation and run instructions
3. ✅ **Data correctness** - correct decoding of events and calculation of statistics

### Additional Points:

1. 🌟 **Temporal Best Practices** - correct use of workflow, activiti and retrays
2. 🌟 **ClickHouse** - use to store time-series data
3. 🌟 **Performance** - efficient batching and parallelization of queries
4. 🌟 **Monitoring** - metrics and health checks
5. 🌟 **Code** - clean architecture, SOLID principles, error handling

### Antipatterns (score reduction):

- ❌ Overengineering simple tasks