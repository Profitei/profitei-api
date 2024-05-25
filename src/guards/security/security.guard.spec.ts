import { Test, TestingModule } from '@nestjs/testing';
import { SecurityGuard } from './security.guard';

describe('SecurityGuard', () => {
  let guard: SecurityGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityGuard],
    }).compile();

    guard = module.get<SecurityGuard>(SecurityGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
