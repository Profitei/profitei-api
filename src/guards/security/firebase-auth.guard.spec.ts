import { FirebaseAuthGuard } from './firebase-auth.guard';

// Mock do Firebase
jest.mock('../../config/firebase.config', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(() => Promise.resolve(true)), // Assume um token válido por padrão
  }),
}));

describe('FirebaseAuthGuard', () => {
  it('should be defined', () => {
    expect(new FirebaseAuthGuard()).toBeDefined();
  });

  // Adicione aqui mais testes conforme necessário
});
