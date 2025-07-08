# p2piano client

Frontend application for p2piano - a real-time collaborative music platform.

## Overview

The client is built with SolidJS and TypeScript, providing a responsive web interface for musicians to collaborate in real-time. It handles audio synthesis, MIDI input, peer-to-peer networking, and the user interface.

## Key Features

- **Real-time audio synthesis** using Web Audio API and Tone.js
- **MIDI controller support** for external keyboards
- **WebRTC peer-to-peer networking** with WebSocket fallback
- **Multi-instrument support** - Piano, bass, acoustic and electric guitar
- **Responsive design** for desktop, tablet, and mobile devices
- **Visual feedback** showing notes played by all participants

## Architecture

### Core Components

- **Audio Engine** (`src/audio/`) - Synthesizers, samplers, and audio processing
- **Networking** (`src/networking/`) - WebRTC and WebSocket communication
- **Controllers** (`src/controllers/`) - Keyboard and MIDI input handling
- **State Management** (`src/app/`) - Centralized application state
- **UI Components** (`src/components/`) - Reusable interface elements

### Technology Stack

- **Framework**: SolidJS with TypeScript
- **Styling**: Vanilla Extract CSS
- **Audio**: Web Audio API, Tone.js
- **Build Tool**: Vite
- **Testing**: Vitest

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
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run typecheck` - TypeScript type checking

### Environment Variables

The client uses environment variables for configuration:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001    # Backend service URL
VITE_WS_URL=ws://localhost:3001            # WebSocket URL

# Development
VITE_DEV_TOOLS=true                        # Enable development tools
```

## Project Structure

```
src/
├── actions/        # State management actions
├── app/           # Store configuration and global state
├── audio/         # Audio engine, synthesizers, and effects
├── clients/       # API communication layer
├── components/    # Reusable UI components
├── controllers/   # Input handling (keyboard, MIDI)
├── networking/    # WebRTC and WebSocket networking
├── pages/         # Route components
├── styles/        # Global styles and themes
└── utils/         # Shared utilities
```

## Contributing

When contributing to the client:

1. Follow the existing TypeScript patterns
2. Add tests for new components and features
3. Ensure all tests pass and coverage requirements are met
4. Use the established styling patterns with Vanilla Extract
5. Test across different browsers and devices