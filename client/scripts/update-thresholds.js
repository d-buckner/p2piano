#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Updates coverage thresholds to current coverage levels
 * Run this manually when you want to lock in improved coverage
 */
function updateThresholds() {
  const coverageSummaryPath = path.join(__dirname, '../coverage/coverage-summary.json');
  const thresholdsPath = path.join(__dirname, '../coverage.thresholds.json');

  // Check if coverage summary exists
  if (!fs.existsSync(coverageSummaryPath)) {
    console.error('❌ Coverage summary not found. Run "npm run test:coverage" first.');
    process.exit(1);
  }

  if (!fs.existsSync(thresholdsPath)) {
    console.error('❌ Coverage thresholds file not found.');
    process.exit(1);
  }

  try {
    const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    const currentThresholds = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'));
    
    const total = coverageSummary.total;
    const newThresholds = {
      lines: parseFloat(total.lines.pct.toFixed(2)),
      functions: parseFloat(total.functions.pct.toFixed(2)),
      branches: parseFloat(total.branches.pct.toFixed(2)),
      statements: parseFloat(total.statements.pct.toFixed(2)),
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Current Coverage:');
    console.log(`  Lines: ${newThresholds.lines}%`);
    console.log(`  Functions: ${newThresholds.functions}%`);
    console.log(`  Branches: ${newThresholds.branches}%`);
    console.log(`  Statements: ${newThresholds.statements}%`);

    console.log('\n📋 Previous Thresholds:');
    console.log(`  Lines: ${currentThresholds.lines}%`);
    console.log(`  Functions: ${currentThresholds.functions}%`);
    console.log(`  Branches: ${currentThresholds.branches}%`);
    console.log(`  Statements: ${currentThresholds.statements}%`);

    // Show what will change
    const changes = [];
    if (newThresholds.lines !== currentThresholds.lines) {
      changes.push(`Lines: ${currentThresholds.lines}% → ${newThresholds.lines}%`);
    }
    if (newThresholds.functions !== currentThresholds.functions) {
      changes.push(`Functions: ${currentThresholds.functions}% → ${newThresholds.functions}%`);
    }
    if (newThresholds.branches !== currentThresholds.branches) {
      changes.push(`Branches: ${currentThresholds.branches}% → ${newThresholds.branches}%`);
    }
    if (newThresholds.statements !== currentThresholds.statements) {
      changes.push(`Statements: ${currentThresholds.statements}% → ${newThresholds.statements}%`);
    }

    if (changes.length > 0) {
      console.log('\n🔄 Changes:');
      changes.forEach(change => console.log(`  ${change}`));
      
      fs.writeFileSync(thresholdsPath, JSON.stringify(newThresholds, null, 2) + '\n');
      console.log('\n✅ Coverage thresholds updated successfully!');
      
      // Auto-stage the updated thresholds file
      try {
        execSync('git add coverage.thresholds.json', { cwd: path.dirname(__dirname) });
        console.log('📝 Updated thresholds file has been staged automatically.');
      } catch (error) {
        console.log('⚠️  Please manually stage the updated coverage.thresholds.json file.');
      }
    } else {
      console.log('\n✅ No changes needed - thresholds are already up to date.');
    }

  } catch (error) {
    console.error('❌ Error updating coverage:', error.message);
    process.exit(1);
  }
}

updateThresholds();