#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Validates that all required environment variables are present
 * This helps catch configuration issues early
 */
function validateEnvironmentVariables() {
  console.log("🔍 Validating environment variables...");

  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "API_TOKEN",
  ];

  const optionalVars = [
    "ALLOWED_ORIGINS",
    "RATE_LIMIT_WINDOW",
    "RATE_LIMIT_MAX",
    "LOG_LEVEL",
    "ENABLE_DETAILED_LOGS",
    "SLOW_QUERY_THRESHOLD",
    "MAX_MEMORY_USAGE",
    "PAGINATION_DEFAULT_LIMIT",
    "PAGINATION_MAX_LIMIT",
    "DB_MAX_CONNECTIONS",
    "DB_CONNECTION_TIMEOUT",
    "ENABLE_API_DOCS",
    "ENABLE_METRICS",
  ];

  let hasErrors = false;

  // Check required variables
  console.log("\n📋 Checking required variables:");
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      hasErrors = true;
    } else {
      console.log(
        `✅ ${varName}: ${varName === "DATABASE_URL" || varName === "JWT_SECRET" ? "[HIDDEN]" : process.env[varName]}`,
      );
    }
  });

  // Check optional variables
  console.log("\n📋 Checking optional variables:");
  optionalVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    } else {
      console.log(`⚠️  ${varName}: not set (using default)`);
    }
  });

  // Validate specific values
  console.log("\n🔧 Validating specific configurations:");

  // Check JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error(
      "❌ JWT_SECRET should be at least 32 characters long for security",
    );
    hasErrors = true;
  } else if (process.env.JWT_SECRET) {
    console.log("✅ JWT_SECRET length is adequate");
  }

  // Check DATABASE_URL format
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (url.protocol !== "postgresql:") {
        console.error("❌ DATABASE_URL should start with postgresql://");
        hasErrors = true;
      } else {
        console.log("✅ DATABASE_URL format is valid");
      }
    } catch (error) {
      console.error("❌ DATABASE_URL format is invalid");
      hasErrors = true;
    }
  }

  // Check PORT is a valid number
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    console.error("❌ PORT must be a valid number");
    hasErrors = true;
  } else if (process.env.PORT) {
    console.log("✅ PORT is a valid number");
  }

  if (hasErrors) {
    console.error("\n❌ Environment validation failed!");
    console.error(
      "Please check your .env file and ensure all required variables are set.",
    );
    process.exit(1);
  }

  console.log("\n✅ All environment variables are valid!");
  return true;
}

// Run validation if this script is executed directly
if (require.main === module) {
  // Load .env file if it exists
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
  }

  validateEnvironmentVariables();
}

module.exports = { validateEnvironmentVariables };
