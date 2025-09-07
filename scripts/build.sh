#!/bin/bash

set -e

echo "🔨 Building TypeScript code..."

# Clean dist directory
rm -rf dist/

# Build TypeScript
npm run build

echo "✅ Build completed successfully!"