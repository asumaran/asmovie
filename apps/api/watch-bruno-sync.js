#!/usr/bin/env node

/**
 * File watcher to automatically sync API_SECRET from .env to Bruno environment
 * Usage: npm run watch-bruno-sync
 */

const fs = require('fs');
const path = require('path');
const { readEnvFile, updateBrunoEnv } = require('./sync-bruno-token');

const ENV_FILE = path.join(__dirname, '.env');

function watchEnvFile() {
  console.log('👀 Watching .env file for API_SECRET changes...');
  console.log('📁 File:', ENV_FILE);
  console.log('🔄 Will auto-sync to Bruno environment on changes');
  console.log('💡 Press Ctrl+C to stop watching\n');

  // Initial sync
  const initialToken = readEnvFile();
  if (initialToken) {
    updateBrunoEnv(initialToken);
  }

  // Watch for changes
  fs.watchFile(ENV_FILE, { interval: 1000 }, (curr, prev) => {
    console.log('\n📝 .env file changed, checking for API_SECRET updates...');

    const newToken = readEnvFile();
    if (newToken) {
      updateBrunoEnv(newToken);
      console.log('✨ Bruno environment synced!\n');
    } else {
      console.log('⚠️ API_SECRET not found in .env file\n');
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping file watcher...');
    fs.unwatchFile(ENV_FILE);
    process.exit(0);
  });
}

if (require.main === module) {
  watchEnvFile();
}
