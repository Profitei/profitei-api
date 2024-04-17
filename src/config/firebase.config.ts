import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK;

if (!serviceAccount) {
  throw new Error(
    'A variável de ambiente FIREBASE_ADMIN_SDK não está definida.',
  );
}

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default firebase;
