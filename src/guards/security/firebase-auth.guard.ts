import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
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

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      const userDetails = await this.userService.findByEmail(
        decodedToken.email,
      );
      request.user = userDetails;
      return true;
    } catch (error) {}
  }
}
