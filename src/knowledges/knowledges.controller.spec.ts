import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgesController } from './knowledges.controller';
import { KnowledgesService } from './knowledges.service';

describe('KnowledgesController', () => {
  let controller: KnowledgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgesController],
      providers: [KnowledgesService],
    }).compile();

    controller = module.get<KnowledgesController>(KnowledgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
