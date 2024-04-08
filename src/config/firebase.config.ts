import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

const serviceAccount = process.env.FIREBASE_ADMIN_SDK
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK)
  : undefined;

if (!serviceAccount) {
  throw new Error(
    'A variável de ambiente FIREBASE_ADMIN_SDK não está definida.',
  );
}

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default firebase;
