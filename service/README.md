# p2piano service

Backend service for p2piano - a real-time collaborative music platform.

## Overview

The service is built with NestJS and TypeScript, providing a robust backend for real-time musical collaboration. It handles WebSocket connections, room management, user sessions, and coordinates peer-to-peer networking between clients.

## Key Features

- **Real-time WebSocket communication** for signaling and coordination
- **Room management** with unique 5-letter room codes
- **User session handling** and connection state management
- **WebRTC signaling** to facilitate peer-to-peer connections
- **Database persistence** for rooms and user data
- **RESTful API** for client communication

## Architecture

### Core Components

- **WebSocket Gateway** (`src/websockets/`) - Real-time communication hub
- **Room Management** (`src/rooms/`) - Room creation and coordination
- **Authentication** (`src/auth/`) - User session management
- **Database Layer** (`src/clients/`) - MongoDB integration
- **Entities** (`src/entities/`) - Data models and schemas

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Runtime**: Node.js with Fastify
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Testing**: Jest
- **Validation**: Class-validator

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run typecheck` - TypeScript type checking

### Environment Variables

The service requires these environment variables:

```bash
# Required: Database connection
MONGO_URI=mongodb://localhost:27017/p2piano
MONGO_USERNAME=your_username
MONGO_PASSWORD=your_password

# Required: Security
COOKIE_SECRET=your_secure_random_string

# Optional: Server configuration
NODE_ENV=development          # Environment mode
PORT=3001                     # Server port
CORS_ORIGIN=http://localhost:5173  # Client origin for CORS
```

## Project Structure

```
src/
├── auth/           # Authentication and session management
├── clients/        # Database connection and data access
├── entities/       # Data models and schemas
├── websockets/     # WebSocket gateway and event handlers
├── rooms/          # Room management logic
├── utils/          # Shared utilities and helpers
└── pipes/          # Validation and transformation pipes
```

## API Endpoints

### REST API

- `GET /health` - Health check endpoint
- `POST /rooms` - Create a new room
- `GET /rooms/:code` - Get room information
- `PUT /rooms/:code` - Update room settings

### WebSocket Events

- `join-room` - Join a collaborative room
- `leave-room` - Leave the current room
- `user-update` - Update user information
- `webrtc-signal` - WebRTC signaling data

## Database Schema

### Room Collection

```typescript
{
  code: string;           // 5-letter room code
  createdAt: Date;        // Creation timestamp
  lastActivity: Date;     // Last activity timestamp
  participants: User[];   // Current participants
  settings: RoomSettings; // Room configuration
}
```

### User Collection

```typescript
{
  id: string;         // Unique user identifier
  displayName: string; // User's display name
  instrument: string;  // Selected instrument
  joinedAt: Date;     // Join timestamp
}
```

## Contributing

When contributing to the service:

1. Follow NestJS patterns and conventions
2. Add comprehensive tests for new features
3. Ensure all tests pass and coverage requirements are met
4. Use proper TypeScript types and validation
5. Test WebSocket functionality thoroughly
6. Maintain database schema consistency