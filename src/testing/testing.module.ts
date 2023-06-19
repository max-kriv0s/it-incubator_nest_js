import { Module } from '@nestjs/common';
import { BlogsModule } from 'src/blogs/blogs.module';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';

@Module({
  imports: [BlogsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
