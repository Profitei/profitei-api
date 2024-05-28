import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserService } from '../../user/user.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;

  const mockFirebaseService = {
    verifyIdToken: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: UserService, useValue: mockUserService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow public routes', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const result = await guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({ headers: {} });

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { authorization: 'Bearer ' },
    });

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should validate Firebase token and set user on request', async () => {
    const token = 'validToken';
    const decodedToken = { email: 'test@example.com' };
    const userDetails = { id: 1, email: 'test@example.com' };

    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { authorization: `Bearer ${token}` },
    });
    mockFirebaseService.verifyIdToken.mockResolvedValue(decodedToken);
    mockUserService.findByEmail.mockResolvedValue(userDetails);

    const result = await guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    const request = mockExecutionContext.getRequest();

    expect(result).toBe(true);
    expect(request.user).toBe(userDetails);
    expect(mockFirebaseService.verifyIdToken).toHaveBeenCalledWith(token);
    expect(mockUserService.findByEmail).toHaveBeenCalledWith(
      decodedToken.email,
    );
  });

  it('should throw error if Firebase token verification fails', async () => {
    const token = 'invalidToken';

    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { authorization: `Bearer ${token}` },
    });
    mockFirebaseService.verifyIdToken.mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(Error);
  });

  it('should throw error if user retrieval fails', async () => {
    const token = 'validToken';
    const decodedToken = { email: 'test@example.com' };

    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { authorization: `Bearer ${token}` },
    });
    mockFirebaseService.verifyIdToken.mockResolvedValue(decodedToken);
    mockUserService.findByEmail.mockRejectedValue(
      new Error('Failed to retrieve user'),
    );

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(Error);
  });
});
