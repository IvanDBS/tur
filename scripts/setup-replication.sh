#!/bin/bash

# Database Replication Setup Script
# This script sets up PostgreSQL replication for the tour booking system

set -e

echo "Setting up PostgreSQL replication..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PRIMARY_DB="postgres"
REPLICA_DB="postgres_replica"
REPLICATION_USER="replicator"
REPLICATION_PASSWORD="${POSTGRES_REPLICATION_PASSWORD:-replicator_password}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if containers exist
if ! docker ps -a --format "table {{.Names}}" | grep -q "$PRIMARY_DB"; then
    print_error "Primary database container '$PRIMARY_DB' not found."
    print_error "Please run 'docker-compose -f docker-compose.production.yml up -d postgres' first."
    exit 1
fi

print_status "Setting up replication user on primary database..."

# Create replication user on primary
docker exec -i "$PRIMARY_DB" psql -U backend -d backend_production << EOF
-- Create replication user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$REPLICATION_USER') THEN
        CREATE ROLE $REPLICATION_USER WITH REPLICATION LOGIN PASSWORD '$REPLICATION_PASSWORD';
    END IF;
END
\$\$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE backend_production TO $REPLICATION_USER;
GRANT USAGE ON SCHEMA public TO $REPLICATION_USER;

-- Show replication user info
\du $REPLICATION_USER
EOF

print_status "Checking primary database replication settings..."

# Check WAL level
WAL_LEVEL=$(docker exec -i "$PRIMARY_DB" psql -U backend -d backend_production -t -c "SHOW wal_level;")
print_status "Primary WAL level: $WAL_LEVEL"

if [ "$WAL_LEVEL" != "replica" ]; then
    print_warning "WAL level is not set to 'replica'. Replication may not work properly."
fi

# Check max_wal_senders
MAX_WAL_SENDERS=$(docker exec -i "$PRIMARY_DB" psql -U backend -d backend_production -t -c "SHOW max_wal_senders;")
print_status "Max WAL senders: $MAX_WAL_SENDERS"

print_status "Setting up replica database..."

# Start replica container
docker-compose -f docker-compose.production.yml up -d postgres_replica

# Wait for replica to be ready
print_status "Waiting for replica to be ready..."
sleep 10

# Check replica status
if docker ps --format "table {{.Names}}" | grep -q "$REPLICA_DB"; then
    print_status "Replica container is running."
else
    print_error "Failed to start replica container."
    exit 1
fi

# Test replication
print_status "Testing replication..."

# Create test table on primary
docker exec -i "$PRIMARY_DB" psql -U backend -d backend_production << EOF
-- Create test table
CREATE TABLE IF NOT EXISTS replication_test (
    id SERIAL PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert test data
INSERT INTO replication_test (message) VALUES ('Replication test from primary');

-- Show data
SELECT * FROM replication_test;
EOF

# Wait a moment for replication
sleep 5

# Check if data is replicated
REPLICATED_DATA=$(docker exec -i "$REPLICA_DB" psql -U backend -d backend_production -t -c "SELECT COUNT(*) FROM replication_test;" 2>/dev/null || echo "0")

if [ "$REPLICATED_DATA" -gt 0 ]; then
    print_status "Replication is working! Found $REPLICATED_DATA records on replica."
    
    # Show replicated data
    docker exec -i "$REPLICA_DB" psql -U backend -d backend_production << EOF
SELECT * FROM replication_test;
EOF
else
    print_warning "Replication test failed. Data not found on replica."
fi

# Check replica lag
print_status "Checking replica lag..."
LAG=$(docker exec -i "$REPLICA_DB" psql -U backend -d backend_production -t -c "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) as lag_seconds;" 2>/dev/null || echo "N/A")

if [ "$LAG" != "N/A" ]; then
    print_status "Replica lag: ${LAG} seconds"
else
    print_warning "Could not determine replica lag."
fi

# Clean up test data
docker exec -i "$PRIMARY_DB" psql -U backend -d backend_production << EOF
DROP TABLE IF EXISTS replication_test;
EOF

print_status "Replication setup completed!"
print_status "Primary database: $PRIMARY_DB"
print_status "Replica database: $REPLICA_DB"
print_status "Replication user: $REPLICATION_USER"

echo ""
print_status "Next steps:"
echo "1. Update your environment variables:"
echo "   DATABASE_REPLICA_URL=postgresql://backend:password@postgres_replica:5432/backend_production"
echo "   POSTGRES_REPLICATION_PASSWORD=$REPLICATION_PASSWORD"
echo ""
echo "2. Restart your Rails application to use replication:"
echo "   docker-compose -f docker-compose.production.yml restart backend"
echo ""
echo "3. Monitor replication health:"
echo "   curl http://localhost/api/v1/admin/database-replication/status"
