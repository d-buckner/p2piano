#!/usr/bin/env node

/**
 * Coverage Consolidator Script
 * 
 * This script consolidates coverage reports from both client and service
 * into a unified view, making it easier to understand overall test coverage.
 */

const fs = require('fs');
const path = require('path');

function loadCoverageData(projectPath) {
  const coveragePath = path.join(projectPath, 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.log(`⚠️  Coverage data not found for ${path.basename(projectPath)}`);
    console.log(`   Expected: ${coveragePath}`);
    console.log(`   Run: npm run test:cov:${path.basename(projectPath)}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading coverage data for ${path.basename(projectPath)}:`, error.message);
    return null;
  }
}

function formatCoveragePercent(value) {
  if (typeof value === 'object' && value.pct !== undefined) {
    return `${value.pct.toFixed(2)}%`;
  }
  return 'N/A';
}

function formatCoverageNumbers(value) {
  if (typeof value === 'object') {
    return `${value.covered}/${value.total}`;
  }
  return 'N/A';
}

function getColorForPercent(percent) {
  if (percent >= 80) return '🟢'; // Green
  if (percent >= 60) return '🟡'; // Yellow  
  if (percent >= 40) return '🟠'; // Orange
  return '🔴'; // Red
}

function displayProjectCoverage(projectName, coverageData) {
  if (!coverageData || !coverageData.total) {
    console.log(`\n📊 ${projectName.toUpperCase()} Coverage: No data available\n`);
    return;
  }

  const { total } = coverageData;
  
  console.log(`\n📊 ${projectName.toUpperCase()} Coverage Report:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const metrics = [
    ['Lines', total.lines],
    ['Functions', total.functions], 
    ['Branches', total.branches],
    ['Statements', total.statements],
  ];

  metrics.forEach(([metric, data]) => {
    const percent = data.pct;
    const color = getColorForPercent(percent);
    const percentStr = formatCoveragePercent(data);
    const numbersStr = formatCoverageNumbers(data);
    
    console.log(`${color} ${metric.padEnd(12)}: ${percentStr.padStart(8)} (${numbersStr})`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function displayConsolidatedSummary(clientData, serviceData) {
  console.log('\n🎯 CONSOLIDATED COVERAGE SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!clientData?.total || !serviceData?.total) {
    console.log('⚠️  Cannot generate consolidated summary - missing coverage data');
    return;
  }

  const client = clientData.total;
  const service = serviceData.total;
  
  // Calculate weighted averages based on total lines of code
  const totalLines = client.lines.total + service.lines.total;
  const totalFunctions = client.functions.total + service.functions.total;
  const totalBranches = client.branches.total + service.branches.total;
  const totalStatements = client.statements.total + service.statements.total;
  
  const weightedLines = ((client.lines.covered + service.lines.covered) / totalLines * 100);
  const weightedFunctions = ((client.functions.covered + service.functions.covered) / totalFunctions * 100);
  const weightedBranches = ((client.branches.covered + service.branches.covered) / totalBranches * 100);
  const weightedStatements = ((client.statements.covered + service.statements.covered) / totalStatements * 100);
  
  const overallMetrics = [
    ['Lines', weightedLines, `${client.lines.covered + service.lines.covered}/${totalLines}`],
    ['Functions', weightedFunctions, `${client.functions.covered + service.functions.covered}/${totalFunctions}`],
    ['Branches', weightedBranches, `${client.branches.covered + service.branches.covered}/${totalBranches}`],
    ['Statements', weightedStatements, `${client.statements.covered + service.statements.covered}/${totalStatements}`],
  ];

  overallMetrics.forEach(([metric, percent, numbers]) => {
    const color = getColorForPercent(percent);
    const percentStr = `${percent.toFixed(2)}%`;
    
    console.log(`${color} ${metric.padEnd(12)}: ${percentStr.padStart(8)} (${numbers})`);
  });
  
  const averagePercent = (weightedLines + weightedFunctions + weightedBranches + weightedStatements) / 4;
  const overallColor = getColorForPercent(averagePercent);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`${overallColor} Overall Score: ${averagePercent.toFixed(2)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function displayRecommendations(clientData, serviceData) {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const recommendations = [];
  
  if (clientData?.total) {
    const client = clientData.total;
    if (client.lines.pct < 50) {
      recommendations.push('🔴 Client: Consider adding more unit tests for better line coverage');
    }
    if (client.branches.pct < 70) {
      recommendations.push('🟡 Client: Add tests for edge cases to improve branch coverage');
    }
  }
  
  if (serviceData?.total) {
    const service = serviceData.total;
    if (service.functions.pct < 80) {
      recommendations.push('🟡 Service: Focus on testing untested functions');
    }
    if (service.branches.pct < 80) {
      recommendations.push('🟡 Service: Add tests for error handling and edge cases');
    }
  }
  
  if (recommendations.length === 0) {
    console.log('🎉 Great job! Coverage looks good across both projects.');
  } else {
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\n📁 View detailed reports:');
  console.log('   • Client:  client/coverage/index.html');
  console.log('   • Service: service/coverage/index.html');
}

function main() {
  console.log('🧪 p2piano Test Coverage Consolidator\n');
  
  const rootDir = path.resolve(__dirname, '..');
  const clientData = loadCoverageData(path.join(rootDir, 'client'));
  const serviceData = loadCoverageData(path.join(rootDir, 'service'));
  
  if (clientData) {
    displayProjectCoverage('client', clientData);
  }
  
  if (serviceData) {
    displayProjectCoverage('service', serviceData);
  }
  
  if (clientData || serviceData) {
    displayConsolidatedSummary(clientData, serviceData);
    displayRecommendations(clientData, serviceData);
  } else {
    console.log('\n❌ No coverage data found. Run tests first:');
    console.log('   npm run test:cov');
  }
  
  console.log();
}

if (require.main === module) {
  main();
}

module.exports = { loadCoverageData, displayProjectCoverage, displayConsolidatedSummary };