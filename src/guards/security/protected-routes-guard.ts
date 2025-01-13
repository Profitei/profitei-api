import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { UserService } from '../../user/user.service';

@Injectable()
export class ProtectedRoutesGuard implements CanActivate {
  private readonly logger = new Logger(ProtectedRoutesGuard.name);

  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isRabbitContext(context)) {
      return true;
    }

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Recuperando os cabeçalhos
    const consumerId = request.headers['x-consumer-id'];
    const consumerUsername = request.headers['x-consumer-username'];
    const email = request.headers['x-consumer-custom-id'];

    // Log all headers
    this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);

    // Logando os valores
    this.logger.log(`X-Consumer-ID: ${consumerId}`);
    this.logger.log(`X-Consumer-Username: ${consumerUsername}`);

    if (!email || typeof email !== 'string') {
      throw new ForbiddenException('Invalid X-Consumer-Custom-ID header');
    }

    try {
      this.logger.log('Setting User Request Property');
      const userDetails = await this.userService.findByEmail(email);
      request.user = userDetails;
      return true;
    } catch (error) {
      this.logger.error('Failed to retrieve user details', error.stack);
      throw new UnauthorizedException('Failed to retrieve user details');
    }
  }
}