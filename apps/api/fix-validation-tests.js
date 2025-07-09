#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/config/validation.schema.spec.ts');
let content = fs.readFileSync(filePath, 'utf8');

// List of patterns to replace with baseTestData usage
const patterns = [
  // Simple cases with just DATABASE_URL
  {
    from: /const { error } = validationSchema\.validate\(\{\s*DATABASE_URL: ['"`][^'"`]*['"`],?\s*\}\);/g,
    to: 'const { error } = validationSchema.validate(baseTestData);',
  },
  {
    from: /const { value } = validationSchema\.validate\(\{\s*DATABASE_URL: ['"`][^'"`]*['"`],?\s*\}\);/g,
    to: 'const { value } = validationSchema.validate(baseTestData);',
  },
  // Cases with DATABASE_URL and one other property
  {
    from: /validationSchema\.validate\(\{\s*([A-Z_]+):\s*([^,}]+),\s*DATABASE_URL: ['"`][^'"`]*['"`],?\s*\}\)/g,
    to: 'validationSchema.validate({\n        ...baseTestData,\n        $1: $2,\n      })',
  },
  {
    from: /validationSchema\.validate\(\{\s*DATABASE_URL: ['"`][^'"`]*['"`],\s*([A-Z_]+):\s*([^,}]+),?\s*\}\)/g,
    to: 'validationSchema.validate({\n        ...baseTestData,\n        $1: $2,\n      })',
  },
  // Cases with multiple properties
  {
    from: /validationSchema\.validate\(\{\s*([^}]+DATABASE_URL[^}]+)\s*\}\)/g,
    to: (match, p1) => {
      // Parse the properties
      const props = p1
        .split(',')
        .map((prop) => prop.trim())
        .filter(
          (prop) =>
            prop &&
            !prop.includes('DATABASE_URL') &&
            !prop.includes('API_TOKEN'),
        );

      if (props.length === 0) {
        return 'validationSchema.validate(baseTestData)';
      } else {
        return `validationSchema.validate({\n        ...baseTestData,\n        ${props.join(',\n        ')},\n      })`;
      }
    },
  },
];

// Apply replacements
patterns.forEach((pattern) => {
  content = content.replace(pattern.from, pattern.to);
});

// Also fix any remaining cases manually
const manualReplacements = [
  // Empty validate calls
  {
    from: 'validationSchema.validate({})',
    to: 'validationSchema.validate(baseTestData)',
  },
  // Cases where we need specific fixes
  {
    from: 'validationSchema.validate({ NODE_ENV: value })',
    to: 'validationSchema.validate({ ...baseTestData, NODE_ENV: value })',
  },
  {
    from: "validationSchema.validate({ PORT: 'abc' })",
    to: "validationSchema.validate({ ...baseTestData, PORT: 'abc' })",
  },
];

manualReplacements.forEach((replacement) => {
  content = content.replace(
    new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    replacement.to,
  );
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Validation tests fixed!');
