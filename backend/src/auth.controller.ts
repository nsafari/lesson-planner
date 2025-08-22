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
    const user = await this.userService.findUserWithStudent(username);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // بررسی وضعیت تایید کاربر
      if (user.approvalStatus === 'pending') {
        throw new BadRequestException('حساب کاربری شما در انتظار تایید مدیر سیستم است');
      }

      if (user.approvalStatus === 'rejected') {
        throw new BadRequestException('حساب کاربری شما رد شده است. لطفاً با مدیر سیستم تماس بگیرید');
      }
      
      // اگر کاربر دانش‌آموز است، اطلاعات دانش‌آموز را برگردان
      if (user.userType === 'student' && user.student) {
        return { 
          message: 'Sign-in successful', 
          username: user.username, 
          imageUrl: user.imageUrl,
          userType: 'student',
          studentId: user.student.id,
          studentInfo: {
            firstName: user.student.firstName,
            lastName: user.student.lastName,
            email: user.student.email,
            studentId: user.student.studentId
          }
        };
      }
      
      // اگر کاربر مدیر است
      if (user.userType === 'admin') {
        return { 
          message: 'Sign-in successful', 
          username: user.username, 
          imageUrl: user.imageUrl,
          userType: 'admin'
        };
      }

      // اگر کاربر تایید شده اما دانش‌آموز نیست
      return { 
        message: 'Sign-in successful', 
        username: user.username, 
        imageUrl: user.imageUrl,
        userType: 'student',
        approvalStatus: user.approvalStatus
      };
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
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('phoneNumber') phoneNumber: string,
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
      // ایجاد کاربر با وضعیت pending
      await this.userService.createPendingUser(username, password, imageUrl, {
        firstName,
        lastName,
        email,
        phoneNumber
      });
      return { 
        message: 'ثبت نام با موفقیت انجام شد. در انتظار تایید مدیر سیستم هستید.',
        status: 'pending'
      };
    } catch (error) {
      throw new BadRequestException(`خطا در ثبت نام: ${error.message}`);
    }
  }
}
