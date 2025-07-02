# P2Piano

[![CI](https://img.shields.io/github/actions/workflow/status/d-buckner/p2piano/test-coverage.yml?branch=main&label=CI)](https://github.com/d-buckner/p2piano/actions)
[![Client Coverage](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/d-buckner/p2piano/main/client/coverage.thresholds.json&label=Client%20Coverage&query=$.lines&suffix=%25&colorB=green&valColorA=red&valColorB=yellow&valColorC=green&valThresholdA=50&valThresholdB=70)](https://github.com/d-buckner/p2piano/tree/main/client/coverage)
[![Service Coverage](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/d-buckner/p2piano/main/service/coverage.thresholds.json&label=Service%20Coverage&query=$.lines&suffix=%25&colorB=green&valColorA=red&valColorB=yellow&valColorC=green&valThresholdA=50&valThresholdB=70)](https://github.com/d-buckner/p2piano/tree/main/service/coverage)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

A real-time collaborative piano platform that enables musicians to play together over the internet with advanced audio synchronization.

### Key Features

- **Real-time collaboration** with advanced latency compensation
- **Multiple instruments** including piano, bass, and guitar with high-quality samples
- **MIDI keyboard support** for external hardware integration
- **Peer-to-peer networking** via WebRTC for minimal latency
- **No registration required**
- **Visual feedback** with real-time note visualization
- **Cross-platform compatibility** supporting desktop, tablet, and mobile devices

## Quick Start

**Prerequisites:** Ensure you have `podman-compose` or `docker-compose` installed locally.

```bash
git clone https://github.com/d-buckner/p2piano.git
cd p2piano
npm run bootstrap  # Install dependencies
npm run dev        # Start development environment
```

Access the application at `http://localhost:5173`


## Architecture

### Core Components

**Client Architecture:**
- **Audio Synchronization Engine**: Measures latency and coordinates timing between participants
- **Instrument System**: Software synthesizers with high-quality samples for multiple instruments
- **Network Controller**: Manages WebRTC peer connections with WebSocket fallback
- **State Management**: Centralized application state with reactive updates

**Server Architecture:**
- **WebSocket Gateway**: Real-time communication hub for signaling and coordination
- **Room Management**: Creates and manages collaborative sessions with unique room codes
- **Session Handling**: User authentication and connection state management
- **Database Layer**: Persistent storage for rooms and user sessions

**Communication Flow:**
1. **Initial Connection**: Clients connect via WebSocket to join/create rooms
2. **Peer Discovery**: Server facilitates WebRTC peer connection establishment
3. **Direct Communication**: Musical data flows peer-to-peer for minimal latency
4. **Fallback Handling**: Server-mediated communication when P2P fails

## Technical Implementation

### Audio Synchronization

P2Piano implements an audio synchronization system that measures network latency and schedules audio events using the Web Audio API for sample-level timings.

### Networking Strategy

- **WebRTC**: Peer-to-peer connections for low-latency communication
- **WebSocket**: Room changes, server-mediated connections for signaling and fallback
- **Transport selection**: Automatic selection based on connection availability

## Project Structure

```
p2piano/
├── client/                 # SolidJS frontend application
│   ├── src/
│   │   ├── actions/        # Application actions
│   │   ├── app/           # Store configuration and providers
│   │   ├── audio/         # Audio engine and instrument implementations
│   │   ├── clients/       # API and service clients
│   │   ├── components/    # UI components and styling
│   │   ├── controllers/   # Input controllers (keyboard, MIDI)
│   │   ├── handlers/      # Event handlers
│   │   ├── lib/           # Core libraries and utilities
│   │   ├── networking/    # WebRTC and WebSocket networking
│   │   ├── pages/         # Route components
│   │   ├── selectors/     # State selectors
│   │   ├── styles/        # Global styles and theming
│   │   └── workers/       # Service workers
├── service/               # NestJS backend service
│   ├── src/
│   │   ├── clients/       # Database adapters
│   │   ├── entities/      # Data models
│   │   └── gateways/      # WebSocket handlers
└── docker-compose.yml     # Multi-service orchestration
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (for containerized development)
- MongoDB (if running services independently)

## Support

For technical questions, bug reports, or feature requests, please use the GitHub issue tracker.
