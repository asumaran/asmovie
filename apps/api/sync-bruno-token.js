#!/usr/bin/env node

/**
 * Script to sync API_SECRET from .env to Bruno environment
 * Usage: npm run sync-bruno-token
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '.env');
const BRUNO_ENV_FILE = path.join(
  __dirname,
  'bruno',
  'environments',
  'Local.bru',
);

function readEnvFile() {
  try {
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      if (line.startsWith('API_SECRET=')) {
        // Extract the value, removing quotes if present
        const value = line.split('=')[1].replace(/["']/g, '');
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return null;
  }
}

function updateBrunoEnv(apiSecret) {
  try {
    let brunoContent = fs.readFileSync(BRUNO_ENV_FILE, 'utf8');

    // Update the api_token line
    const updatedContent = brunoContent.replace(
      /api_token: .*/,
      `api_token: ${apiSecret}`,
    );

    fs.writeFileSync(BRUNO_ENV_FILE, updatedContent);
    console.log('✅ Bruno environment updated successfully!');
    console.log(`📝 API token set to: ${apiSecret}`);
    return true;
  } catch (error) {
    console.error('Error updating Bruno environment:', error.message);
    return false;
  }
}

function main() {
  console.log('🔄 Syncing API token from .env to Bruno environment...');

  const apiSecret = readEnvFile();
  if (!apiSecret) {
    console.error('❌ API_SECRET not found in .env file');
    process.exit(1);
  }

  const success = updateBrunoEnv(apiSecret);
  if (!success) {
    process.exit(1);
  }

  console.log('🎉 Token sync completed!');
}

if (require.main === module) {
  main();
}

module.exports = { readEnvFile, updateBrunoEnv };
