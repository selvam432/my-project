#!/bin/bash
# Run TalentBridge Backend
echo "🚀 Starting TalentBridge Backend..."

cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

# Create upload dirs
mkdir -p uploads/profiles uploads/resumes uploads/posts

# Run Flask
echo "✅ Backend running at http://localhost:5000"
python app.py
