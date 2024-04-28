import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const serviceAccount = process.env.FIREBASE_ADMIN_SDK;

        if (!serviceAccount) {
          throw new Error(
            'A variável de ambiente FIREBASE_ADMIN_SDK não está definida.',
          );
        }

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }

        return admin;
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
