# Automerge JS Implementation Guide

## Overview
Automerge is a CRDT (Conflict-Free Replicated Data Type) library for building collaborative applications with automatic conflict resolution and offline support.

## Core Architecture & Principles

### Network-Agnostic Design
- Works with any connection protocol (WebSocket, WebRTC, HTTP, etc.)
- Supports client-server, peer-to-peer, or hybrid architectures
- Can sync via unidirectional channels (even email attachments)
- No built-in networking - you implement the transport layer

### Immutable State Management
- Every change creates a new document state
- Previous states remain accessible (time-travel debugging)
- Integrates naturally with React/Redux patterns
- Documents are frozen after operations like `merge()`

### Automatic Conflict Resolution
- CRDT technology ensures deterministic merging
- No merge conflicts - concurrent changes automatically resolve
- Commutative operations guarantee consistent state across all peers
- No central authority required for conflict resolution

### Local-First Architecture
- Each device maintains its own complete data copy
- Full functionality offline
- Sync when network becomes available
- Reduced latency - no server round-trips for local operations

## Implementation Essentials

### 1. Document Lifecycle

```javascript
import * as Automerge from '@automerge/automerge'

// Create new document
const doc = Automerge.init()

// Modify document (immutable - returns new version)
const doc2 = Automerge.change(doc, 'Add task', d => {
  d.tasks = []
  d.tasks.push({ id: 1, title: 'Learn Automerge', done: false })
})

// Clone document (creates new actor ID)
const docCopy = Automerge.clone(doc2)

// Create read-only view (lightweight, shares memory)
const snapshot = Automerge.view(doc2, Automerge.getHeads(doc2))
```

### 2. Data Types

#### Basic Types
- Standard JSON types work as expected
- Objects and arrays become CRDTs automatically

#### Special CRDT Types
```javascript
// Counter - commutative integer
const doc = Automerge.change(Automerge.init(), d => {
  d.visits = new Automerge.Counter(0)
})

const doc2 = Automerge.change(doc, d => {
  d.visits.increment(1)  // or increment(5)
  d.visits.decrement(1)  // or decrement(3)
})

// Text - collaborative text editing
const doc = Automerge.change(Automerge.init(), d => {
  d.content = new Automerge.Text('Hello world')
})
```

### 3. Synchronization

```javascript
// Initialize sync state for new peer
let syncState = Automerge.initSyncState()

// Generate sync message to send
const [nextSyncState, syncMessage] = Automerge.generateSyncMessage(doc, syncState)
if (syncMessage) {
  // Send syncMessage to peer via your network transport
  network.send(syncMessage)
}

// Receive and process sync message
const [updatedDoc, updatedSyncState] = Automerge.receiveSyncMessage(
  doc, 
  syncState, 
  incomingMessage
)

// After receiving, generate response if needed
const [finalSyncState, response] = Automerge.generateSyncMessage(
  updatedDoc, 
  updatedSyncState
)
```

### 4. Merging Documents

```javascript
// Merge changes from another document
const mergedDoc = Automerge.merge(localDoc, remoteDoc)

// IMPORTANT: Both input docs are frozen after merge
// Must clone if you need to modify further
const editableDoc = Automerge.clone(mergedDoc)
```

### 5. Change Tracking

```javascript
// Extract changes between versions
const changes = Automerge.getChanges(oldDoc, newDoc)

// Apply changes to another document
const updatedDoc = Automerge.applyChanges(targetDoc, changes)

// Track changes with patches
const docWithPatches = Automerge.change(doc, { patchCallback: (patches) => {
  console.log('Changes:', patches)
}}, d => {
  d.field = 'new value'
})
```

### 6. Persistence

```javascript
// Save document to binary format
const binary = Automerge.save(doc)

// Load document from binary
const loadedDoc = Automerge.load(binary)

// For incremental loading of large documents
let doc = Automerge.init()
doc = Automerge.loadIncremental(doc, binary)
```

## Key Implementation Patterns

### Actor IDs
- Each document instance has unique actor ID
- Prevents duplicate sequence numbers in distributed system
- Generated automatically or specified explicitly
- New actor ID created on `clone()`

### Sync Protocol Flow
1. Initialize sync state when connecting to new peer
2. Generate and exchange sync messages
3. Continue exchanging until both peers are synchronized
4. Maintain sync state per peer connection

### Performance Considerations
- Use `view()` for read-only access (lightweight)
- Use `clone()` sparingly (full memory copy)
- Batch changes in single `change()` call when possible
- Consider `loadIncremental()` for large documents

### Error Handling
- Documents frozen after `merge()` - must clone before editing
- `getChanges()` crashes if oldState has changes not in newState
- `view()` throws if specified heads aren't in document
- No type validation on `load()` - ensure type safety

## Common Implementation Tasks

### 1. Real-time Collaboration
```javascript
// On document change
const newDoc = Automerge.change(currentDoc, d => { /* mutations */ })

// Sync with all connected peers
peers.forEach(peer => {
  const [nextState, msg] = Automerge.generateSyncMessage(newDoc, peer.syncState)
  if (msg) peer.send(msg)
  peer.syncState = nextState
})
```

### 2. Offline Support
```javascript
// Work offline
let offlineDoc = Automerge.change(doc, d => { /* changes */ })

// When reconnected
const syncedDoc = Automerge.merge(offlineDoc, serverDoc)
```

### 3. History/Undo
```javascript
// Save document states
const history = [doc1, doc2, doc3]

// Revert to previous state
const previousDoc = history[history.length - 2]
```

## Integration Checklist

- [ ] Choose network transport (WebSocket, WebRTC, etc.)
- [ ] Implement message passing between peers
- [ ] Set up sync state management per peer
- [ ] Handle connection/disconnection events
- [ ] Implement persistence (save/load)
- [ ] Add error handling for frozen documents
- [ ] Consider using Automerge-Repo for batteries-included setup
- [ ] Plan for actor ID management
- [ ] Design schema with CRDT types in mind
- [ ] Test concurrent modification scenarios