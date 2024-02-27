import { Test, TestingModule } from '@nestjs/testing';
import { ArmesController } from './armes.controller';
import { ArmesService } from './armes.service';

describe('ArmesController', () => {
  let controller: ArmesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArmesController],
      providers: [ArmesService],
    }).compile();

    controller = module.get<ArmesController>(ArmesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
