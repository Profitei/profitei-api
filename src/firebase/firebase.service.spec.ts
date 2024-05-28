import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const mAuth = {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  };
  return {
    credential: {
      cert: jest.fn(),
    },
    initializeApp: jest.fn().mockReturnValue({
      auth: jest.fn().mockReturnValue(mAuth),
    }),
    apps: [],
    auth: jest.fn().mockReturnValue(mAuth),
  };
});

describe('FirebaseService', () => {
  let service: FirebaseService;
  const mockServiceAccount = 'mockServiceAccount';

  beforeEach(async () => {
    process.env.FIREBASE_ADMIN_SDK = mockServiceAccount;

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Firebase admin app if not initialized', () => {
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: admin.credential.cert(mockServiceAccount),
    });
  });

  it('should return the admin app', () => {
    const adminApp = service.getAdmin();
    expect(adminApp).toBeDefined();
  });

  describe('verifyIdToken', () => {
    it('should verify ID token', async () => {
      const idToken = 'mockIdToken';
      const mockDecodedToken = { uid: 'mockUid' };
      (admin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );

      const result = await service.verifyIdToken(idToken);
      expect(result).toEqual(mockDecodedToken);
      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(idToken, true);
    });

    it('should throw an error if ID token verification fails', async () => {
      const idToken = 'mockIdToken';
      (admin.auth().verifyIdToken as jest.Mock).mockRejectedValue(
        new Error('Failed to verify ID token'),
      );

      await expect(service.verifyIdToken(idToken)).rejects.toThrow(
        'Failed to verify ID token',
      );
    });
  });

  describe('getUser', () => {
    it('should get user by UID', async () => {
      const uid = 'mockUid';
      const mockUserRecord = { uid, email: 'test@example.com' };
      (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

      const result = await service.getUser(uid);
      expect(result).toEqual(mockUserRecord);
      expect(admin.auth().getUser).toHaveBeenCalledWith(uid);
    });

    it('should throw an error if get user fails', async () => {
      const uid = 'mockUid';
      (admin.auth().getUser as jest.Mock).mockRejectedValue(
        new Error('Failed to retrieve user'),
      );

      await expect(service.getUser(uid)).rejects.toThrow(
        'Failed to retrieve user',
      );
    });
  });
});
