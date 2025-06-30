import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../app.module';
import SessionProvider from '../../entities/Session';

describe('Notes WebSocket Integration', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let serverUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    serverUrl = `http://localhost:${address.port}`;
  });

  beforeEach(async () => {
    const session = await SessionProvider.create('test-session-id');
    
    clientSocket = io(serverUrl, {
      query: {
        roomId: 'test-room',
        displayName: 'Test User'
      },
      extraHeaders: {
        cookie: `sessionId=${session.sessionId}`
      }
    });
    
    return new Promise<void>((resolve) => {
      clientSocket.on('connect', resolve);
    });
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle note on events', (done) => {
    const noteData = {
      note: 'C4',
      velocity: 0.8,
      timestamp: Date.now()
    };

    clientSocket.emit('notes:note_on', noteData);
    
    clientSocket.on('notes:note_on', (data) => {
      expect(data.note).toBe(noteData.note);
      expect(data.velocity).toBe(noteData.velocity);
      done();
    });
  });

  it('should handle note off events', (done) => {
    const noteData = {
      note: 'C4',
      timestamp: Date.now()
    };

    clientSocket.emit('notes:note_off', noteData);
    
    clientSocket.on('notes:note_off', (data) => {
      expect(data.note).toBe(noteData.note);
      done();
    });
  });
});