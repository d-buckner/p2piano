#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec: execCallback } = require('child_process');
const { promisify } = require('util');
const { platform } = require('os');

const exec = promisify(execCallback);

// Determine the correct compose command - prefer podman-compose, fallback to docker-compose
async function getComposeCommand() {
  try {
    await exec('podman-compose --version');
    return 'podman-compose';
  } catch (e) {
    return 'docker-compose';
  }
}

// Helper to run spawn as a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', ...options });
    process.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Wait for database to be healthy
async function waitForDatabase(composeCmd) {
  console.log('Waiting for database to be ready...');
  
  while (true) {
    try {
      await exec(`${composeCmd} -f docker-compose.dev.yml exec -T database mongosh --username root --password password --authenticationDatabase admin --eval "db.adminCommand('ping')"`);
      console.log('Database is ready!');
      return;
    } catch (error) {
      console.log('Database not ready yet, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Wait for Redis to be healthy
async function waitForRedis(composeCmd) {
  console.log('Waiting for Redis to be ready...');
  
  while (true) {
    try {
      await exec(`${composeCmd} -f docker-compose.dev.yml exec -T redis redis-cli ping`);
      console.log('Redis is ready!');
      return;
    } catch (error) {
      console.log('Redis not ready yet, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Start the database and Redis containers
async function startContainers(composeCmd) {
  console.log('Ensuring database and Redis containers are running...');
  
  try {
    // Try to start with --no-recreate flag
    await runCommand(composeCmd, ['-f', 'docker-compose.dev.yml', 'up', '-d', '--no-recreate', 'database', 'redis']);
    console.log('Database and Redis containers are running');
  } catch (error) {
    // If that fails, try to restart existing containers
    console.log('Attempting to restart existing containers...');
    try {
      await runCommand(composeCmd, ['-f', 'docker-compose.dev.yml', 'restart', 'database', 'redis']);
      console.log('Database and Redis containers restarted successfully');
    } catch (restartError) {
      console.error('Failed to start containers');
      console.error(`You may need to run: ${composeCmd} -f docker-compose.dev.yml down`);
      process.exit(1);
    }
  }
}

// Start dev servers
async function startDevServers() {
  console.log('Starting client and service...');
  
  const devProcess = spawn('npm', ['run', 'servers:dev'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGO_URI: 'mongodb://root:password@localhost:27017/p2piano?authSource=admin',
      REDIS_URI: 'redis://localhost:6379'
    }
  });

  devProcess.on('exit', (code) => {
    process.exit(code);
  });
}

// Main function
async function main() {
  console.log('Checking container status...');
  
  try {
    const composeCmd = await getComposeCommand();
    console.log(`Using ${composeCmd} for container management`);
    
    await startContainers(composeCmd);
    
    // Wait a bit before health check
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await Promise.all([
      waitForDatabase(composeCmd),
      waitForRedis(composeCmd),
    ]);
    await startDevServers();
  } catch (error) {
    console.error('Error starting development environment:', error.message);
    process.exit(1);
  }
}

// Run main function
main();