import { Module } from '@nestjs/common';
import { BlogsModule } from 'src/blogs/blogs.module';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [BlogsModule, UsersModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
