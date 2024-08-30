import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  private adminApp: admin.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK;
    if (!serviceAccount) {
      throw new Error(
        'The FIREBASE_ADMIN_SDK environment variable is not defined.',
      );
    }

    if (!admin.apps.length) {
      this.adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      this.adminApp = admin.apps[0];
    }
  }

  getAdmin() {
    return this.adminApp;
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.adminApp
        .auth()
        .verifyIdToken(idToken, true);
      return decodedToken;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Failed to verify ID token');
    }
  }

  async getUser(uid: string) {
    try {
      const userRecord = await this.adminApp.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Failed to retrieve user');
    }
  }

  async sendNotification(uid: string, title: string, message:string) {
    try {
      const messagePayload: Message = {
        notification: {
          title,
          body: message,
        },
        token: uid,
      };
      
      await this.adminApp.messaging().send(messagePayload);
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to send notification');
    }
  }
}
