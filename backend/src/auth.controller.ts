import { Controller, Post, Body, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from  'multer';
import { extname } from  'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('signin')
  @UseInterceptors(FileInterceptor('username')) // Intercept any field
  async signIn(
    @Body('username') username: string,
    @Body('password') password: string
  ) {
    const isValid = await this.userService.validateUser(username, password);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const user = await this.userService.findUser(username);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return { message: 'Sign-in successful', username: user.username, imageUrl: user.imageUrl };
  }

  @Post('signup')
  @UseInterceptors(FileInterceptor('userImage', {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `${randomName}${extname(file.originalname)}`)
      }
    })
  }))
  async signUp(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('retryPassword') retryPassword: string,
    @UploadedFile() userImage: Express.Multer.File,
  ) {
    if (password !== retryPassword) {
      throw new BadRequestException('پسوردها یکسان نیستند');
    }

    let imageUrl = null;
    if (userImage) {
      imageUrl = `/uploads/${userImage.filename}`;
    }

    try {
      await this.userService.createUser(username, password, imageUrl);
      return { message: 'ثبت نام با موفقیت انجام شد' };
    } catch (error) {
      throw new BadRequestException(`خطا در ثبت نام: ${error.message}`);
    }
  }
}
