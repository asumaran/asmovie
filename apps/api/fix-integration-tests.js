#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/movies/movies.integration.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Define patterns to add authentication headers
const patterns = [
  // POST requests
  {
    from: /(\s+)(\.post\([^)]+\))\s*\n(\s+)(\.send\([^)]+\))/g,
    to: "$1$2\n$1.set('Authorization', `Bearer ${API_TOKEN}`)\n$3$4",
  },
  // PATCH requests
  {
    from: /(\s+)(\.patch\([^)]+\))\s*\n(\s+)(\.send\([^)]+\))/g,
    to: "$1$2\n$1.set('Authorization', `Bearer ${API_TOKEN}`)\n$3$4",
  },
  // DELETE requests (no send usually)
  {
    from: /(\s+)(\.delete\([^)]+\))\s*\n(\s+)(\.expect\(\d+\))/g,
    to: "$1$2\n$1.set('Authorization', `Bearer ${API_TOKEN}`)\n$3$4",
  },
];

// Apply replacements
patterns.forEach((pattern) => {
  content = content.replace(pattern.from, pattern.to);
});

// Handle special cases where request continues on same line
const singleLinePatterns = [
  // Single line POST/PATCH/DELETE with .send()
  {
    from: /(\.post\([^)]+\)\.send\([^)]+\))/g,
    to: (match) =>
      match.replace(
        '.send(',
        `.set('Authorization', \`Bearer \${API_TOKEN}\`).send(`,
      ),
  },
  {
    from: /(\.patch\([^)]+\)\.send\([^)]+\))/g,
    to: (match) =>
      match.replace(
        '.send(',
        `.set('Authorization', \`Bearer \${API_TOKEN}\`).send(`,
      ),
  },
  // Single line DELETE
  {
    from: /(\.delete\([^)]+\)\.expect\(\d+\))/g,
    to: (match) =>
      match.replace(
        '.expect(',
        `.set('Authorization', \`Bearer \${API_TOKEN}\`).expect(`,
      ),
  },
];

singleLinePatterns.forEach((pattern) => {
  if (typeof pattern.to === 'function') {
    content = content.replace(pattern.from, pattern.to);
  } else {
    content = content.replace(pattern.from, pattern.to);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Integration tests updated with API token authentication!');
