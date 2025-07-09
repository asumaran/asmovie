#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/movies/movies.integration.spec.ts");

try {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace all Authorization headers with X-API-Token headers
  content = content.replace(
    /\.set\('Authorization', `Bearer \$\{API_TOKEN\}`\)/g,
    ".set('X-API-Token', API_TOKEN)",
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ Successfully updated movies integration tests");
  console.log("   - Changed Authorization headers to X-API-Token headers");
} catch (error) {
  console.error("❌ Error updating movies integration tests:", error.message);
  process.exit(1);
}
