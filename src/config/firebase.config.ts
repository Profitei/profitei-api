import * as admin from 'firebase-admin';
import serviceAccount from './profitei-firebase-adminsdk-ikxkn-5378e2c303.json';

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default firebase;
