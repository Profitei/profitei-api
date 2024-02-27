import { Test, TestingModule } from '@nestjs/testing';
import { ArmesService } from './armes.service';

describe('ArmesService', () => {
  let service: ArmesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArmesService],
    }).compile();

    service = module.get<ArmesService>(ArmesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
