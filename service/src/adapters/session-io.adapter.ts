import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import ConfigProvider from '../config/ConfigProvider';
import { SessionValidatorService } from '../services/session-validator.service';
import type { RawHttpRequest } from '../types/raw-request';
import type { INestApplicationContext} from '@nestjs/common';
import type { ServerOptions, Server } from 'socket.io';


export class SessionIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SessionIoAdapter.name);
  private sessionValidator!: SessionValidatorService;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    // Get the SessionValidatorService from the application context
    this.sessionValidator = this.app.get(SessionValidatorService);

    const server = super.createIOServer(port, {
      ...options,
      transports: ['websocket'], // Use only WebSocket transport to avoid the need for sticky sessions
      allowRequest: async (req: RawHttpRequest, callback: (err: Error | null, success: boolean) => void) => {
        try {
          // Validate session using the shared validator
          const session = await this.sessionValidator.validateRawRequest(req);
          
          if (!session) {
            this.logger.warn('WebSocket connection rejected - invalid or missing session');
            callback(new Error('Session required'), false);
            return;
          }

          // Session is valid, allow the connection
          // The actual session attachment to socket happens in the connection handler
          callback(null, true);
        } catch (error) {
          this.logger.error('WebSocket authentication error:', error);
          callback(new Error('Authentication error'), false);
        }
      },
    });

    // Set up Redis adapter for distributed Socket.IO asynchronously
    this.setupRedisAdapter(server);

    return server;
  }

  private async setupRedisAdapter(server: Server): Promise<void> {
    try {
      const pubClient = createClient({ url: ConfigProvider.getRedisUri() });
      const subClient = pubClient.duplicate();

      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);

      server.adapter(createAdapter(pubClient, subClient));
      this.logger.log('Redis adapter configured for distributed Socket.IO');
    } catch (error) {
      this.logger.error('Failed to configure Redis adapter:', error);
      this.logger.warn('Socket.IO running in single-server mode');
    }
  }
}
