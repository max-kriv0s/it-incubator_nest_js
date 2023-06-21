import { Module, forwardRef } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs-query.repository';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';
import { Blog, BlogSchema } from './blog.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports: [BlogsRepository],
})
export class BlogsModule {}
