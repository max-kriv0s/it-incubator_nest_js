import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts-query.repository';
import { PostsRepository } from './posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { BlogsModule } from 'src/blogs/blogs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    BlogsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository],
  exports: [PostsRepository],
})
export class PostsModule {}
