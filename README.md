# p2piano

[![CI](https://img.shields.io/github/actions/workflow/status/d-buckner/p2piano/test-coverage.yml?branch=main&label=CI)](https://github.com/d-buckner/p2piano/actions)
[![Client Coverage](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/d-buckner/p2piano/main/client/coverage.thresholds.json&label=Client%20Coverage&query=$.lines&suffix=%25&colorB=green&valColorA=red&valColorB=yellow&valColorC=green&valThresholdA=50&valThresholdB=70)](https://github.com/d-buckner/p2piano/tree/main/client/coverage)
[![Service Coverage](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/d-buckner/p2piano/main/service/coverage.thresholds.json&label=Service%20Coverage&query=$.lines&suffix=%25&colorB=green&valColorA=red&valColorB=yellow&valColorC=green&valThresholdA=50&valThresholdB=70)](https://github.com/d-buckner/p2piano/tree/main/service/coverage)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**A real-time collaborative music platform where musicians can play together from anywhere in the world.**

p2piano enables instant musical collaboration through your web browser. Create a room, share the code with friends, and start jamming together. No downloads, no registration required.

**[Try it out](https://p2piano.com)**

![P2Piano Demo](docs/demo-screenshot.png)

## ✨ Features

- 🎹 **Multiple Instruments** - Piano, electric bass, acoustic and electric guitar
- ⚡ **Real-Time Sync** - Advanced audio synchronization keeps everyone in time
- 🎮 **MIDI Support** - Connect your MIDI keyboard for the full experience
- 🌐 **Works Everywhere** - Any modern browser on desktop, tablet, or mobile
- 🔗 **Instant Sharing** - Just share a 5-letter room code to invite others
- 🎵 **Visual Feedback** - See notes as they're played by you and collaborators
- 🚫 **No Registration** - Start playing immediately, no account needed
- 📱 **Cross-Platform** - Seamless experience across all devices

## 🚀 Quick Start Guide

### For Users

1. **Visit the [website](https://p2piano.com)**
2. **Click "Create New Room"** or **enter a 5-letter room code**
3. **Choose your instrument** from the dropdown menu
4. **Set your display name** so others can identify you
5. **Start playing!** Use your keyboard, touch, mouse, or MIDI controller

#### Tips
- Avoid wireless headphones and keyboards if possible, these add considerable latency
- Unmute your iOS device to enable sound
- Piano keys map to your computer keyboard (A-K for white keys, W-O for black keys)

### For Developers

**Prerequisites:** Node.js 20+, podman-compose or docker-compose

```bash
git clone https://github.com/d-buckner/p2piano.git
cd p2piano
npm run bootstrap  # Install dependencies
npm run dev        # Start development environment
```

The application will be available at `http://localhost:5173`


## Architecture

### Core Components

**Client Architecture:**
- **Audio Synchronization Engine**: Measures latency and coordinates timing between participants
- **Instrument System**: Synthesizers and samplers for multiple instruments. Progressive sample loading.
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

p2piano implements an audio synchronization system that measures network latency and schedules audio events using the Web Audio API for sample-level timings.

### Networking Strategy

- **WebRTC**: Peer-to-peer connections for low-latency communication
- **WebSocket**: Room changes, server-mediated connections for signaling and fallback
- **Transport selection**: Automatic selection based on connection availability

## 📂 Project Structure

```
p2piano/
├── 🎨 client/              # Frontend (SolidJS + TypeScript)
│   ├── src/
│   │   ├── 🎬 actions/     # State management actions
│   │   ├── 🏪 app/         # Store configuration
│   │   ├── 🎵 audio/       # Audio engine & instruments
│   │   ├── 🌐 clients/      # API communication
│   │   ├── 🧩 components/  # UI components
│   │   ├── 🎮 controllers/ # Input handling (keyboard, MIDI)
│   │   ├── 📡 networking/  # WebRTC & WebSocket
│   │   ├── 📄 pages/       # Route components
│   │   └── 🎨 styles/      # Styling & themes
├── ⚙️  service/            # Backend (NestJS + TypeScript)
│   ├── src/
│   │   ├── 🗄️  clients/    # Database layer
│   │   ├── 📊 entities/    # Data models
│   │   ├── 🚪 websockets/  # Real-time communication
│   │   ├── 🛡️  auth/       # Authentication & authorization
│   │   └── 🔧 utils/       # Shared utilities
├── 🐳 docker-compose.yml   # Container orchestration
├── 📋 package.json         # Workspace configuration
└── 📚 docs/                # Documentation & assets
```

### Key Technologies

- **Frontend**: SolidJS, TypeScript, Vanilla Extract CSS, Vite
- **Backend**: NestJS, Fastify, MongoDB, Socket.IO
- **Audio**: Web Audio API, Tone.js for synthesis
- **Networking**: WebRTC for P2P, WebSocket fallback
- **Testing**: Vitest, comprehensive unit & integration tests
- **DevOps**: Docker, GitHub Actions, automated testing & coverage

### Development Commands

```bash
# Install dependencies for all packages
npm run bootstrap

# Start development servers (client + service)
npm run dev

# Run individual services
npm run client:dev    # Frontend only
npm run service:dev   # Backend only

# Testing
npm run test          # Run all tests
npm run test:coverage # Generate coverage reports
npm run test:watch    # Watch mode for development

# Code quality
npm run lint          # Check code style
npm run lint:fix      # Auto-fix issues
npm run typecheck     # TypeScript validation

# Production builds
npm run build         # Build all packages
npm run container     # Build and run with Docker
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/p2piano
MONGO_USERNAME=your_username
MONGO_PASSWORD=your_password

# Security
COOKIE_SECRET=your_secure_random_string

# Optional: Production settings
NODE_ENV=development
PORT=3001
```

## 🤝 Contributing

Contributions are welcome! Whether you're a developer, musician, or just someone with ideas:

- **🐛 Report bugs** using the [issue tracker](https://github.com/d-buckner/p2piano/issues)
- **💡 Suggest features** that would improve the experience
- **🔧 Submit pull requests** for bug fixes or enhancements
- **📖 Improve documentation** to help others understand and use the project
- **🎵 Share your music** and experiences using P2Piano

### Development Contributions

Before contributing code:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm run test`)
5. Run linting (`npm run lint:fix`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request
