import { Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [BlogsModule, UsersModule, CommentsModule, PostsModule],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
