#!/bin/bash

set -e

echo "🔨 Building TypeScript code..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci
fi

# Run linting first
echo "🔍 Running linter..."
# npm run lint

# Clean dist directory
echo "🧹 Cleaning dist directory..."
rm -rf dist/

# Build TypeScript
echo "📝 Compiling TypeScript..."
npm run build

# Copy package.json to dist for ES module support
echo "📋 Copying package.json for ES module support..."
cp package.json dist/

# Build Lambda Layer
echo "🏗️ Building Lambda layers..."
./layers/octokit/build.sh

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist directory not created"
  exit 1
fi

if [ ! -f "layers/octokit/octokit-layer.zip" ]; then
  echo "❌ Layer build failed: octokit-layer.zip not created"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build artifacts available in dist/"