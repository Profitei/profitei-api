import { FirebaseAuthGuard } from './firebase-auth.guard';

describe('SecurityGuard', () => {
  it('should be defined', () => {
    expect(new FirebaseAuthGuard()).toBeDefined();
  });
});
