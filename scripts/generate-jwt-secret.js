#!/usr/bin/env node
/**
 * Generate a secure random JWT_SECRET for production use
 *
 * Usage:
 *   node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

function generateJWTSecret() {
  // Generate a 32-byte random string and convert to base64
  const secret = crypto.randomBytes(32).toString('base64');

  console.log('\n========================================');
  console.log('  Generated JWT_SECRET (copy this):');
  console.log('========================================\n');
  console.log(secret);
  console.log('\n========================================');
  console.log('  Instructions:');
  console.log('========================================\n');
  console.log('1. Copy the secret above');
  console.log('2. Add JWT_SECRET to your Render environment variables');
  console.log('3. Keep this value secure and never commit it to git\n');
}

generateJWTSecret();
