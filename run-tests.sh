#!/bin/bash
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 TakeNote QA Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Restore Allure history for trend graphs
if [ -d "/app/allure-history/history" ]; then
  echo "📈 Restoring Allure history..."
  cp -r /app/allure-history/history /app/allure-results/history
fi

# Run tests (don't exit on failure — we still want the report)
echo "🧪 Running tests..."
npm test || TEST_FAILED=1

# Generate Allure report
echo "📊 Generating Allure report..."
allure generate allure-results --clean -o allure-report

# Persist history for next run
echo "💾 Saving history..."
mkdir -p /app/allure-history
cp -r /app/allure-report/history /app/allure-history/history

# Serve report
echo ""
echo "✅ Report ready → http://localhost:5050"
echo "   Press Ctrl+C to stop"
echo ""
allure open allure-report --port 5050

exit ${TEST_FAILED:-0}
