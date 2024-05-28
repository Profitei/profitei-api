import { Test, TestingModule } from '@nestjs/testing';
import { SecurityGuard } from './security.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('SecurityGuard', () => {
  let guard: SecurityGuard;

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
        SecurityGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<SecurityGuard>(SecurityGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow no-auth routes', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const result = guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if API key is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({ headers: {} });

    expect(() =>
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if API key is invalid', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { 'x-api-key': 'invalidKey' },
    });
    process.env.API_KEY = 'validKey';

    expect(() =>
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).toThrow(UnauthorizedException);
  });

  it('should validate API key and allow access', () => {
    const validApiKey = 'validKey';
    process.env.API_KEY = validApiKey;

    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockExecutionContext.getRequest.mockReturnValue({
      headers: { 'x-api-key': validApiKey },
    });

    const result = guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
  });
});
