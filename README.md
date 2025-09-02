# DeBridge Finance - Data Engineer Challenge

[![CI/CD Pipeline](https://github.com/debridge-finance/data-enginner-challenge-task/actions/workflows/ci.yml/badge.svg)](https://github.com/debridge-finance/data-enginner-challenge-task/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive ETL pipeline for cross-chain transaction processing using modern technologies.

Welcome to the DeBridge Finance Data Engineer challenge! This project simulates a real-world ETL pipeline for processing cross-chain transaction data. You'll be working with a modern tech stack to build a scalable data processing system.

**DeBridge** is a cross-chain bridge protocol that enables seamless asset transfers between different blockchains. Your task is to complete the implementation of an ETL pipeline that processes, enriches, and analyzes cross-chain transactions.

## 🎯 Challenge Objectives

Your goal is to complete the implementation of key components in this ETL pipeline within **1-1.5 hours**. The project provides a solid foundation with TODO comments marking where your implementation is needed.

### What You'll Implement

1. **Temporal Workflow Logic** - Complete the cross-chain transaction processing workflow
2. **Database Operations** - Implement MongoDB and ClickHouse data operations
3. **API Endpoints** - Complete REST API endpoints for data retrieval
4. **Error Handling** - Add robust error handling and retry logic
5. **Data Validation** - Implement comprehensive data validation

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Blockchain    │───▶│   Temporal       │───▶│   Databases     │
│   Data Sources  │    │   Workflows      │    │   (Mongo/CH)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   REST API       │
                       │   (Express.js)   │
                       └──────────────────┘
```

### Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Orchestration**: Temporal.io for workflow management
- **Databases**: MongoDB (raw data) + ClickHouse (analytics)
- **API**: Fastify with comprehensive validation and performance optimization
- **Testing**: Jest with MongoDB Memory Server and Temporal Testing
- **Infrastructure**: Docker Compose for local development

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- pnpm (recommended) or npm

### 1. Environment Setup

```bash
# Clone and navigate to project
cd debridge-de-challenge

# Copy environment file
cp .env.example .env

# Install dependencies
pnpm install
```

### 2. Start Infrastructure

```bash
# Start all services (MongoDB, ClickHouse, Temporal, etc.)
docker compose up -d

# Wait for services to be healthy (check with)
docker compose ps
```

### 3. Initialize Databases

```bash
# Create database schemas and indexes
npm run init-db

# Load mock transaction data (1000+ transactions)
npm run load-mock-data
```

### 4. Start Application

```bash
# Terminal 1: Start API server
npm run dev

# Terminal 2: Start Temporal worker
npm run worker
```

### 5. Verify Setup

- **API Health**: http://localhost:3000/health
- **Temporal UI**: http://localhost:8080
- **API Documentation**: See [API Endpoints](#api-endpoints) section

## 📋 Implementation Tasks

### Task 1: Complete Temporal Workflow (Priority: HIGH)

**File**: `src/workflows/cross-chain-transaction.ts`

Implement the `processCrossChainTransaction` workflow:

```typescript
// TODO: Implement the main workflow logic
// 1. Fetch raw transaction data from blockchain
// 2. Validate the transaction data
// 3. Enrich with price data
// 4. Save enriched data to MongoDB
// 5. Aggregate metrics to ClickHouse
// 6. Handle retries and error scenarios
```

**Key Requirements**:
- Proper error handling with different retry policies
- Activity timeouts and compensation logic
- Progress tracking and logging

### Task 2: Database Operations (Priority: HIGH)

**Files**: 
- `src/activities/index.ts`
- `src/config/database.ts`

Complete the database operations:

```typescript
// TODO: Implement MongoDB save operation
await saveToMongoDB(enrichedTransaction);

// TODO: Implement ClickHouse aggregation
await aggregateToClickHouse(enrichedTransaction);
```

**Key Requirements**:
- Upsert logic for handling duplicates
- Batch operations for performance
- Proper indexing and query optimization

### Task 3: API Implementation (Priority: MEDIUM)

**Files**: `src/api/routes/*.ts`

Complete the REST API endpoints:

```typescript
// TODO: Implement volume statistics calculation
// TODO: Implement transaction querying with filters
// TODO: Implement top tokens aggregation
// TODO: Implement chain pair statistics
```

**Key Requirements**:
- Proper query parameter validation
- Efficient database queries
- Pagination for large datasets
- Error handling and response formatting

### Task 4: Data Validation (Priority: MEDIUM)

**File**: `src/activities/index.ts`

Implement comprehensive validation:

```typescript
// TODO: Implement transaction validation
// 1. Validate transaction format
// 2. Check for required fields
// 3. Validate chain and token combinations
// 4. Check for suspicious patterns
```

### Task 5: Error Handling (Priority: MEDIUM)

**Throughout the codebase**

Add robust error handling:
- Network timeout handling
- Database connection failures
- Invalid data scenarios
- Rate limiting and backpressure

## 🔌 API Endpoints

### Volume Statistics
```bash
GET /api/stats/volume?from=ethereum&to=polygon&period=24h
GET /api/stats/processing-time
```

### Transactions
```bash
GET /api/transactions?status=completed&limit=50&offset=0
GET /api/transactions/:hash
```

### Tokens
```bash
GET /api/tokens/top?metric=volume&limit=10
GET /api/tokens/:token/stats
```

### Chain Analytics
```bash
GET /api/chains/pairs
GET /api/chains/performance
```

### Health Check
```bash
GET /health
```

## 🧪 Testing Your Implementation

### 1. Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run specific test suites
npm test -- --testPathPattern=api
npm test -- --testPathPattern=workflows
npm test -- --testPathPattern=activities

# Run tests in watch mode during development
npm test -- --watch
```

### 2. API Testing

```bash
# Test volume statistics
curl "http://localhost:3000/api/stats/volume?period=24h"

# Test transaction listing
curl "http://localhost:3000/api/transactions?limit=10"

# Test top tokens
curl "http://localhost:3000/api/tokens/top?metric=volume"

# Test health check
curl "http://localhost:3000/health"
```

### 3. Test Coverage Requirements

The comprehensive test suite evaluates:

- **API Endpoints**: All REST endpoints with various parameters
- **Temporal Workflows**: Workflow execution and error handling
- **Activities**: Individual activity functions and integrations
- **Database Operations**: MongoDB and ClickHouse interactions
- **Mock Services**: Blockchain and price service simulations
- **Error Scenarios**: Network failures, invalid data, timeouts
- **Edge Cases**: Boundary conditions and data validation

### 2. Workflow Testing

Use the Temporal UI at http://localhost:8080 to:
- Start new workflows
- Monitor workflow execution
- Debug failed workflows
- View activity logs

### 3. Database Verification

```bash
# Check MongoDB data
docker exec -it debridge-mongodb mongosh debridge --eval "db.enrichedTransactions.countDocuments()"

# Check ClickHouse data
docker exec -it debridge-clickhouse clickhouse-client --query "SELECT COUNT(*) FROM debridge.transaction_metrics"
```

## 📊 Mock Data

The project includes realistic mock data:

- **1000+ transactions** across 7 days
- **5 blockchains**: Ethereum, Polygon, BSC, Arbitrum, Solana
- **12+ tokens**: USDC, USDT, WETH, WBTC, DAI, LINK, UNI, AAVE, MATIC, BNB, ARB, SOL
- **Realistic patterns**: Volume distributions, processing times, success rates

## 🎯 Evaluation Criteria

### Technical Implementation (40%)
- Code quality and TypeScript usage
- Proper error handling and validation
- Database query optimization
- Temporal workflow design

### System Design (30%)
- Understanding of ETL patterns
- Scalability considerations
- Data modeling decisions
- Performance optimizations

### Problem Solving (20%)
- Approach to handling edge cases
- Debugging and troubleshooting
- Code organization and structure

### Communication (10%)
- Code comments and documentation
- Explanation of design decisions
- Questions and clarifications

## 🔧 Troubleshooting

### Common Issues

**Services not starting**:
```bash
# Check service logs
docker compose logs temporal
docker compose logs mongodb
docker compose logs clickhouse

# Restart specific service
docker compose restart temporal
```

**Database connection errors**:
```bash
# Verify database initialization
pnpm run init-db

# Check database connectivity
docker exec -it debridge-mongodb mongosh --eval "db.adminCommand('ping')"
```

**Temporal workflow issues**:
- Check Temporal UI at http://localhost:8080
- Verify worker is running: `pnpm run worker`
- Check activity timeouts and retry policies

### Performance Tips

1. **Database Queries**: Use proper indexes and limit result sets
2. **Batch Operations**: Process data in batches for better performance
3. **Temporal Activities**: Keep activities idempotent and stateless
4. **Memory Usage**: Stream large datasets instead of loading everything

## 📚 Resources

- [Temporal.io Documentation](https://docs.temporal.io/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [ClickHouse Node.js Client](https://clickhouse.com/docs/en/integrations/language-clients/nodejs)
- [Express.js Guide](https://expressjs.com/en/guide/)

## 🤝 Getting Help

During the interview:
1. **Ask questions** - We encourage clarification and discussion
2. **Think out loud** - Explain your approach and reasoning
3. **Focus on key areas** - Prioritize high-impact implementations
4. **Don't get stuck** - Move on if something is blocking you

## 🎯 Challenge Graduation Criteria

Your performance will be evaluated based on the following criteria:

### 📊 **Satisfied** (Minimum Passing Grade)
- **One important task completed correctly**
- Basic functionality working (e.g., one API endpoint or one activity)
- Code compiles and runs without critical errors
- Shows understanding of the tech stack

### 🎉 **Good** (Above Average Performance)
- **Some important tasks completed correctly**
- **Their tests are fixed and passing**
- Multiple components working together
- Proper error handling in implemented areas
- Clean, readable code structure

### 🌟 **Awesome** (Excellent Performance)
- **All tests are "green" (passing)**
- **Service works as expected end-to-end**
- Complete ETL pipeline functional
- All API endpoints working correctly
- Proper integration between all components
- Demonstrates strong technical skills

### 🚀 **EXTRA** (Outstanding Performance)
- **Code was improved and refactored**
- **Covered with additional test cases**
- Performance optimizations implemented
- Enhanced error handling and monitoring
- Additional features or improvements beyond requirements
- Production-ready code quality

## 🏁 Submission

When you're ready to present:

1. **Demo the working system** - Show API calls and Temporal workflows
2. **Explain your implementation** - Walk through key code sections
3. **Discuss trade-offs** - Explain your design decisions
4. **Identify improvements** - What would you do with more time?

### 🧪 Running Tests
```bash
# Run all tests to check your progress
pnpm test

# Run specific test suites
pnpm test test/activities/
pnpm test test/api/
pnpm test test/workflows/
```

---

**Good luck! We're excited to see your implementation approach and discuss your solutions.** 🚀
