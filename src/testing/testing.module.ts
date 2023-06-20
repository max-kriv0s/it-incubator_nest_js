import { Module } from '@nestjs/common';
import { BlogsModule } from 'src/blogs/blogs.module';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UsersModule } from 'src/users/users.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [BlogsModule, UsersModule, CommentsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
