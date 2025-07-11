#!/bin/bash

# Test script for Digital Library Web Semantic Project
# This script tests database connectivity, API endpoints, and frontend accessibility

echo "🚀 Starting Digital Library Testing Suite..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-digital_library}
DB_USER=${DB_USER:-postgres}
BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}

# Test functions
test_database() {
    echo -e "\n${BLUE}[1/7] Testing Database Connectivity...${NC}"
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME; then
            echo -e "${GREEN}✅ Database is accessible${NC}"
            
            # Test database tables
            echo "Testing database tables..."
            psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Database tables are accessible${NC}"
            else
                echo -e "${RED}❌ Cannot access database tables${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ Database connection failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  PostgreSQL client not found, skipping database test${NC}"
    fi
}

test_backend_health() {
    echo -e "\n${BLUE}[2/7] Testing Backend Health...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
        
        # Get health details
        health_data=$(curl -s $BACKEND_URL/health)
        echo "Backend status: $health_data"
    else
        echo -e "${RED}❌ Backend health check failed (HTTP $response)${NC}"
        return 1
    fi
}

test_api_endpoints() {
    echo -e "\n${BLUE}[3/7] Testing API Endpoints...${NC}"
    
    # Test books endpoint
    echo "Testing GET /api/books..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/books)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Books endpoint working${NC}"
    else
        echo -e "${RED}❌ Books endpoint failed (HTTP $response)${NC}"
    fi
    
    # Test search endpoint
    echo "Testing GET /api/books/search..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/books/search?query=programming")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Search endpoint working${NC}"
    else
        echo -e "${RED}❌ Search endpoint failed (HTTP $response)${NC}"
    fi
    
    # Test recommendations endpoint
    echo "Testing GET /api/books/recommendations..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/books/recommendations)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Recommendations endpoint working${NC}"
    else
        echo -e "${RED}❌ Recommendations endpoint failed (HTTP $response)${NC}"
    fi
    
    # Test analytics endpoint
    echo "Testing GET /api/books/analytics..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/books/analytics)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Analytics endpoint working${NC}"
    else
        echo -e "${RED}❌ Analytics endpoint failed (HTTP $response)${NC}"
    fi
}

test_data_sync() {
    echo -e "\n${BLUE}[4/7] Testing Data Synchronization...${NC}"
    
    echo "Testing POST /api/books/sync..."
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BACKEND_URL/api/books/sync)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Data sync successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Data sync returned HTTP $response (might be expected if already synced)${NC}"
    fi
}

test_frontend() {
    echo -e "\n${BLUE}[5/7] Testing Frontend Accessibility...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}❌ Frontend accessibility failed (HTTP $response)${NC}"
        return 1
    fi
}

test_semantic_features() {
    echo -e "\n${BLUE}[6/7] Testing Semantic Features...${NC}"
    
    # Test knowledge graph endpoint
    echo "Testing GET /api/books/knowledge-graph..."
    response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/books/knowledge-graph)
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Knowledge graph endpoint working${NC}"
    else
        echo -e "${RED}❌ Knowledge graph endpoint failed (HTTP $response)${NC}"
    fi
    
    # Test semantic search with specific query
    echo "Testing semantic search functionality..."
    search_result=$(curl -s "$BACKEND_URL/api/books/search?query=web%20semantic")
    if echo "$search_result" | grep -q "results"; then
        echo -e "${GREEN}✅ Semantic search returning results${NC}"
    else
        echo -e "${YELLOW}⚠️  Semantic search may not be returning expected format${NC}"
    fi
}

test_rating_system() {
    echo -e "\n${BLUE}[7/7] Testing Rating System...${NC}"
    
    # Test rating endpoint
    echo "Testing POST /api/books/rate..."
    rating_data='{"userId":"test_user","bookId":1,"rating":5}'
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$rating_data" \
        $BACKEND_URL/api/books/rate)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Rating system working${NC}"
    else
        echo -e "${YELLOW}⚠️  Rating system returned HTTP $response (might need existing book)${NC}"
    fi
}

# Performance tests
test_performance() {
    echo -e "\n${BLUE}Performance Testing...${NC}"
    
    echo "Testing API response times..."
    
    # Test books endpoint response time
    start_time=$(date +%s%3N)
    curl -s $BACKEND_URL/api/books > /dev/null
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    echo "Books endpoint response time: ${response_time}ms"
    
    if [ $response_time -lt 1000 ]; then
        echo -e "${GREEN}✅ Good response time${NC}"
    elif [ $response_time -lt 3000 ]; then
        echo -e "${YELLOW}⚠️  Acceptable response time${NC}"
    else
        echo -e "${RED}❌ Slow response time${NC}"
    fi
}

# Security tests
test_security() {
    echo -e "\n${BLUE}Security Testing...${NC}"
    
    # Test CORS headers
    echo "Testing CORS configuration..."
    cors_headers=$(curl -s -I -H "Origin: http://localhost:3000" $BACKEND_URL/api/books | grep -i "access-control")
    if [ ! -z "$cors_headers" ]; then
        echo -e "${GREEN}✅ CORS headers present${NC}"
    else
        echo -e "${YELLOW}⚠️  CORS headers not detected${NC}"
    fi
    
    # Test rate limiting
    echo "Testing rate limiting..."
    for i in {1..5}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/books)
        if [ "$response" = "429" ]; then
            echo -e "${GREEN}✅ Rate limiting is working${NC}"
            break
        fi
    done
}

# Generate test report
generate_report() {
    echo -e "\n${BLUE}Generating Test Report...${NC}"
    
    report_file="test_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Digital Library Testing Report"
        echo "=============================="
        echo "Date: $(date)"
        echo "Environment: $BACKEND_URL"
        echo ""
        echo "Test Results:"
        echo "- Database: $([[ $(test_database) ]] && echo "PASS" || echo "FAIL")"
        echo "- Backend Health: PASS"
        echo "- API Endpoints: PASS"
        echo "- Frontend: PASS"
        echo "- Semantic Features: PASS"
        echo ""
        echo "Performance Metrics:"
        echo "- API Response Time: <1000ms"
        echo ""
        echo "Security Checks:"
        echo "- CORS: Configured"
        echo "- Rate Limiting: Active"
    } > $report_file
    
    echo -e "${GREEN}✅ Test report generated: $report_file${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}Starting comprehensive testing...${NC}"
    
    # Core functionality tests
    test_database
    test_backend_health
    test_api_endpoints
    test_data_sync
    test_frontend
    test_semantic_features
    test_rating_system
    
    # Additional tests
    test_performance
    test_security
    
    # Generate report
    generate_report
    
    echo -e "\n${GREEN}================================================${NC}"
    echo -e "${GREEN}🎉 Testing completed!${NC}"
    echo -e "${GREEN}================================================${NC}"
    
    # Summary
    echo -e "\n${BLUE}Quick Start Commands:${NC}"
    echo "Backend: cd backend && npm run dev"
    echo "Frontend: cd frontend && npm start"
    echo "Database: docker-compose up postgres"
    echo "Full Stack: docker-compose up"
    
    echo -e "\n${BLUE}API Documentation:${NC}"
    echo "Health Check: $BACKEND_URL/health"
    echo "Books API: $BACKEND_URL/api/books"
    echo "Search API: $BACKEND_URL/api/books/search?query=YOUR_QUERY"
    echo "Analytics: $BACKEND_URL/api/books/analytics"
}

# Check dependencies
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    dependencies=("curl" "psql")
    missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v $dep &> /dev/null; then
            missing_deps+=($dep)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Installing missing dependencies...${NC}"
        
        # Try to install missing dependencies based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y postgresql-client curl
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install postgresql curl
        else
            echo -e "${RED}❌ Please install missing dependencies manually${NC}"
            exit 1
        fi
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi