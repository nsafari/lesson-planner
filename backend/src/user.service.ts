import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(username: string, password: string, imageUrl: string | null = null): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      passwordHash,
      imageUrl,
    });
    await this.userRepository.save(user);
  }

  async findUser(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.findUser(username);
    if (!user) {
      return false;
    }
    if (!user.passwordHash) {
      console.error('validateUser: passwordHash is null or undefined for user:', username);
      return false;
    }
    return bcrypt.compare(password, user.passwordHash);
  }

    async updateUserProfile(username: string, imageUrl: string): Promise<void> {
        await this.userRepository.update({ username }, { imageUrl });
    }
}
