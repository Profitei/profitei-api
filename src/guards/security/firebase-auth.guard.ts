import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { isRabbitContext } from '@golevelup/nestjs-rabbitmq';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);
  constructor(
    private firebaseService: FirebaseService,
    private userService: UserService,
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
      throw new UnauthorizedException('Invalid token');
    }

    try {
      this.logger.log('Validating Firebase token');
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const userDetails = await this.userService.findByEmail(
        decodedToken.email,
      );
      request.user = userDetails;
      return true;
    } catch (error) {
      this.logger.error('Failed to authenticate Firebase token', error.stack);
      throw new Error('Failed to authenticate Firebase token');
    }
  }
}
