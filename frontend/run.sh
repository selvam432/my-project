#!/bin/bash
# Run TalentBridge Frontend
echo "🎨 Starting TalentBridge Frontend..."

cd "$(dirname "$0")"

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm packages..."
  npm install
fi

echo "✅ Frontend running at http://localhost:5173"
npm run dev
