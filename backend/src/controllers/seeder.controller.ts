import { Controller, Post } from '@nestjs/common';
import { SampleDataSeeder } from '../seeders/sample-data.seeder';

/**
 * کنترلر «نمونه داده» برای ایجاد داده‌های نمونه در محیط توسعه.
 */
@Controller('seeder')
export class SeederController {
  constructor(private readonly seeder: SampleDataSeeder) { }

  /** اجرای نمونه داده‌ها */
  @Post('seed')
  async seed() {
    try {
      await this.seeder.seed();
      return { message: 'Sample data seeded successfully!' };
    } catch (error) {
      return { error: 'Failed to seed sample data', details: error.message };
    }
  }
} 