import { Module, forwardRef } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsQueryRepository } from './posts-query.repository';
import { PostsRepository } from './posts.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { BlogsModule } from 'src/blogs/blogs.module';
import { CommentsModule } from 'src/comments/comments.module';
import { Blog, BlogSchema } from 'src/blogs/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
    forwardRef(() => BlogsModule),
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository],
  exports: [PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
