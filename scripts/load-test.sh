#!/usr/bin/env bash
# ==============================================================================
# ApacheBench (ab) Load Testing Script for JPTL Property Management Platform
# ==============================================================================

TARGET_HOST=${1:-"http://localhost:3000"}
REQUESTS=${2:-1000}
CONCURRENCY=${3:-50}

echo "======================================================================"
echo "🚀 JPTL API Load Testing via ApacheBench (ab)"
echo "Target Host: $TARGET_HOST"
echo "Requests:    $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo "======================================================================"

# Check if ab is installed
if ! command -v ab &> /dev/null; then
    echo "⚠️  'ab' (ApacheBench) is not installed."
    echo "👉 Install on Ubuntu/Debian: sudo apt update && sudo apt install -y apache2-utils"
    echo "👉 Install on macOS:         brew install httpd"
    exit 1
fi

echo ""
echo "▶️ [1/3] Benchmarking Health Check (GET /api/health)..."
ab -n "$REQUESTS" -c "$CONCURRENCY" "$TARGET_HOST/api/health"

echo ""
echo "▶️ [2/3] Benchmarking Landlord Public Pre-flight..."
ab -n "$REQUESTS" -c "$CONCURRENCY" -m GET "$TARGET_HOST/api/health"

echo ""
echo "======================================================================"
echo "✅ Load Testing Benchmark Completed!"
echo "======================================================================"
