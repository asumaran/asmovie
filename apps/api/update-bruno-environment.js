#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates or creates Bruno environment with production API URL
 * @param {string} apiUrl - The production API URL from AWS deployment
 */
function updateBrunoEnvironment(apiUrl) {
  const brunoDir = path.join(__dirname, 'bruno');
  const environmentsDir = path.join(brunoDir, 'environments');
  const productionEnvPath = path.join(environmentsDir, 'Production.bru');

  // Ensure environments directory exists
  if (!fs.existsSync(environmentsDir)) {
    fs.mkdirSync(environmentsDir, { recursive: true });
  }

  // Clean URL (remove trailing slash if present)
  const cleanApiUrl = apiUrl.replace(/\/$/, '');

  // Create or update Production environment
  const productionEnvContent = `vars {
  host: ${cleanApiUrl}
  api_url: ${cleanApiUrl}
  api_token: production-api-token
  jwt_token: 
}
`;

  try {
    fs.writeFileSync(productionEnvPath, productionEnvContent, 'utf8');
    console.log(
      `✅ Bruno Production environment updated with API URL: ${cleanApiUrl}`,
    );
    console.log(`📁 Environment file: ${productionEnvPath}`);
    console.log(
      `💡 Switch to 'Production' environment in Bruno to test the deployed API`,
    );
    return true;
  } catch (error) {
    console.error(`❌ Error updating Bruno environment: ${error.message}`);
    return false;
  }
}

// Get API URL from command line argument
const apiUrl = process.argv[2];

if (!apiUrl) {
  console.error('❌ API URL is required');
  console.error('Usage: node update-bruno-environment.js <API_URL>');
  process.exit(1);
}

// Validate URL format
try {
  new URL(apiUrl);
} catch (error) {
  console.error(`❌ Invalid URL format: ${apiUrl}`);
  process.exit(1);
}

const success = updateBrunoEnvironment(apiUrl);
process.exit(success ? 0 : 1);
