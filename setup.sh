#!/bin/bash

echo "============================================"
echo "Portfolio Strategy Dashboard Setup"
echo "============================================"
echo ""

echo "Checking for Node.js..."
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

echo "Installing dependencies..."
echo "This may take 1-2 minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "Installation complete!"
    echo "============================================"
    echo ""
    echo "To start the dashboard, run: npm run dev"
    echo "Or run: ./start.sh"
    echo ""
else
    echo ""
    echo "ERROR: Installation failed!"
    echo "Please check your internet connection and try again."
    exit 1
fi
