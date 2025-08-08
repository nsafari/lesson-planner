import { AuthController } from './controllers/auth.controller';
import { UserService } from './user.service';
import { Test } from '@nestjs/testing';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [UserService],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    userService = moduleRef.get<UserService>(UserService);

    // Create a default user for testing
    await userService.createUser('test', 'password');
  });

  it('should return a success message on valid sign-in', async () => {
    const result = await authController.signIn('test', 'password');
    expect(result).toEqual({ message: 'Sign-in successful' });
  });

  it('should throw an error on invalid sign-in', async () => {
    await expect(authController.signIn('test', 'wrongpassword')).rejects.toThrowError('Invalid credentials');
  });
});
