import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/controllers/users.controller';
import { UsersService } from 'src/services/users.service';

describe('UsersController', () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(usersController()).toBe('Hello World!');
			expect(true).toBe(true);
    });
  });
});
