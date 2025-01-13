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
import { decode } from 'jsonwebtoken';

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

    const token = request.headers.authorization?.split(' ')[1];

    if (!token || typeof token !== 'string') {
      throw new ForbiddenException('Invalid token');
    }

    const decodedToken = decode(token);

    try {
      this.logger.log('Setting User Request Property');
      const userDetails = await this.userService.findByEmail(decodedToken['email']);
      request.user = userDetails;
      return true;
    } catch (error) {
      this.logger.error('Failed to retrieve user details', error.stack);
      throw new UnauthorizedException('Failed to retrieve user details');
    }
  }
}