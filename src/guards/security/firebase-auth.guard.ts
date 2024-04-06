import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import firebase from '../../config/firebase.config';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    return firebase
      .auth()
      .verifyIdToken(token)
      .then(() => true)
      .catch(() => {
        throw new UnauthorizedException('Invalid token');
      });
  }
}
