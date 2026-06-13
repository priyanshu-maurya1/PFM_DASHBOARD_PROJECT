#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 16.20.2
cd "/Users/apple/GJ_Tech/GJ Global Services/backend"
npm install
echo "Node version: $(node --version)"
npm list --depth=0
echo "Starting debug server..."
DEBUG=* npm run dev

