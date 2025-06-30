import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../../app.module';
import SessionProvider from '../../entities/Session';

describe('Room WebSocket Integration', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  let serverUrl: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0); // Random available port

    const address = app.getHttpServer().address();
    serverUrl = `http://localhost:${address.port}`;
  });

  beforeEach(async () => {
    // Create a test session
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

  it('should connect to room successfully', (done) => {
    clientSocket.on('room:join', (data) => {
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('room');
      done();
    });
  });

  it('should handle user updates', (done) => {
    const updateData = {
      userId: 'test-session-id',
      color: '#ff0000'
    };

    clientSocket.emit('room:user_update', updateData);
    
    clientSocket.on('room:user_update', (data) => {
      expect(data.userId).toBe(updateData.userId);
      done();
    });
  });

  it('should disconnect properly', (done) => {
    clientSocket.on('disconnect', () => {
      done();
    });
    
    clientSocket.disconnect();
  });
});