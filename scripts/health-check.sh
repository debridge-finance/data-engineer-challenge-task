#!/bin/bash

# Health check script for DeBridge ETL services
set -e

echo "🔍 Checking DeBridge ETL Services Health..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local health_command=$2
    local expected_output=$3
    
    echo -n "Checking $service_name... "
    
    if eval $health_command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Function to check HTTP endpoint
check_http() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ Healthy (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy (HTTP $status)${NC}"
        return 1
    fi
}

# Check Docker services
echo -e "\n📦 Docker Services:"
check_service "MongoDB" "docker exec debridge-mongodb mongosh --quiet --eval 'db.adminCommand(\"ping\")'"
check_service "ClickHouse" "docker exec debridge-clickhouse clickhouse-client --query 'SELECT 1'"
check_service "PostgreSQL" "docker exec debridge-postgres pg_isready -U temporal"
check_service "Redis" "docker exec debridge-redis redis-cli ping"
check_service "Temporal Server" "docker exec debridge-temporal tctl --address temporal:7233 cluster health"

# Check HTTP endpoints
echo -e "\n🌐 HTTP Services:"
check_http "API Server" "http://localhost:3000/health"
check_http "Temporal UI" "http://localhost:8080"

# Check database connectivity and data
echo -e "\n💾 Database Data:"
echo -n "MongoDB transaction count... "
mongo_count=$(docker exec debridge-mongodb mongosh debridge --quiet --eval "db.enrichedTransactions.countDocuments()" 2>/dev/null || echo "0")
if [ "$mongo_count" -gt "0" ]; then
    echo -e "${GREEN}✓ $mongo_count transactions${NC}"
else
    echo -e "${YELLOW}⚠ No transactions found${NC}"
fi

echo -n "ClickHouse metrics count... "
ch_count=$(docker exec debridge-clickhouse clickhouse-client --query "SELECT COUNT(*) FROM debridge.transaction_metrics" 2>/dev/null || echo "0")
if [ "$ch_count" -gt "0" ]; then
    echo -e "${GREEN}✓ $ch_count metrics${NC}"
else
    echo -e "${YELLOW}⚠ No metrics found${NC}"
fi

echo -e "\n🎯 Quick Test Commands:"
echo "curl http://localhost:3000/health"
echo "curl http://localhost:3000/api/stats/volume"
echo "curl http://localhost:3000/api/transactions?limit=5"

echo -e "\n✅ Health check completed!"
