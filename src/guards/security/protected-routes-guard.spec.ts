import { Test, TestingModule } from '@nestjs/testing';
import { ProtectedRoutesGuard } from './protected-routes-guard';
import { FirebaseService } from '../../firebase/firebase.service';
import { UserService } from '../../user/user.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

jest.mock('@golevelup/nestjs-rabbitmq', () => ({
  isRabbitContext: jest.fn().mockReturnValue(false),
}));

describe('FirebaseAuthGuard', () => {
  let guard: ProtectedRoutesGuard;

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
        ProtectedRoutesGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: UserService, useValue: mockUserService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<ProtectedRoutesGuard>(ProtectedRoutesGuard);
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

  it('should throw ForbiddenException if token is missing', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({ headers: {} });

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if token is invalid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { authorization: 'Bearer ' },
    });

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should validate user from x-consumer-custom-id and set user on request', async () => {
    const consumerId = 'consumer-id-123';
    const consumerUsername = 'consumer-username';
    const customId = 'test@example.com'; // Este será usado como email
    const userDetails = { id: 1, email: 'test@example.com' };
  
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: {
        'x-consumer-id': consumerId,
        'x-consumer-username': consumerUsername,
        'x-consumer-custom-id': customId,
      },
    });
    
    mockUserService.findByEmail.mockResolvedValue(userDetails);
  
    const result = await guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    const request = mockExecutionContext.getRequest();
  
    expect(result).toBe(true);
    expect(request.user).toBe(userDetails);
    expect(mockUserService.findByEmail).toHaveBeenCalledWith(customId);
  
    // Adiciona verificações para os logs, se necessário
    expect(mockExecutionContext.getRequest).toHaveBeenCalled();
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
