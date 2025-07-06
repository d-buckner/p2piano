import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SessionValidatorService } from '../services/session-validator.service';
import type { INestApplicationContext} from '@nestjs/common';
import type { ServerOptions, Server } from 'socket.io';


export class SessionIoAdapter extends IoAdapter {
  private readonly logger = new Logger(SessionIoAdapter.name);
  private sessionValidator: SessionValidatorService;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    // Get the SessionValidatorService from the application context
    this.sessionValidator = this.app.get(SessionValidatorService);

    const server = super.createIOServer(port, {
      ...options,
      allowRequest: async (req, callback) => {
        try {
          // Validate session using the shared validator
          const session = await this.sessionValidator.validateRawRequest(req);
          
          if (!session) {
            this.logger.warn('WebSocket connection rejected - invalid or missing session');
            callback('Session required', false);
            return;
          }

          // Session is valid, allow the connection
          // The actual session attachment to socket happens in the connection handler
          callback(null, true);
        } catch (error) {
          this.logger.error('WebSocket authentication error:', error);
          callback('Authentication error', false);
        }
      },
    });

    return server;
  }
}
