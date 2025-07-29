import { Module, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { User } from './ارزیابی.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './مراحل.entity';
import { StoreController } from './store/store.controller';
import { StoreService } from './store/store.service';
import { VistorController } from './vistor/vistor.controller';
import { VistorService } from './vistor/vistor.service';
import { Visitor } from './vistor/visitor.entity';
import { ProfileController } from './profile/profile.controller';
import { SafareshController } from './sefaresh/sefaresh.controller';
import { SafareshService } from './sefaresh/sefaresh.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:', // Use in-memory database
      entities: [Store, Visitor, User],
      synchronize: true, // Automatically create tables
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [StoreController, VistorController, ProfileController, AuthController, SafareshController],
  providers: [StoreService, VistorService, UserService, SafareshService],
})


export class AppModule implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    // Create a default user for testing
    try {
      await this.userService.createUser('test', 'password', null);
      console.log('Default user created');
    } catch (error) {
      console.error('Error creating default user:', error);
    }
  }
}
