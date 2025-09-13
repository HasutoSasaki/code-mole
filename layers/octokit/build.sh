#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAYER_DIR="$SCRIPT_DIR"

echo "Building @octokit/rest Lambda Layer..."

# Clean up previous builds
rm -rf "$LAYER_DIR/nodejs/node_modules"
rm -f "$LAYER_DIR/octokit-layer.zip"

# Navigate to layer directory
cd "$LAYER_DIR"

# Install dependencies for the layer
echo "Installing dependencies..."
cd nodejs
npm install --production --silent

# Create the layer zip
echo "Creating layer zip file..."
cd "$LAYER_DIR"
zip -r octokit-layer.zip nodejs/ -q

echo "Layer built successfully: $LAYER_DIR/octokit-layer.zip"
ls -lh octokit-layer.zip