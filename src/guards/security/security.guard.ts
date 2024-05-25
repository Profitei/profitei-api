import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { NO_AUTH } from '../../decorators/public.decorator';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  private readonly logger = new Logger(SecurityGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const noAuth = this.reflector.getAllAndOverride<boolean>(NO_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (noAuth) {
      return true;
    }

    const apiKey = request.headers['x-api-key'];

    this.logger.log('Validating API key');

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing.');
    }

    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API key.');
    }

    return true;
  }
}
