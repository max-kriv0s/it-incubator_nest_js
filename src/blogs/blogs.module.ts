import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs-query.repository';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';
import { Blog, BlogSchema } from './blog.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
  exports: [BlogsRepository],
})
export class BlogsModule {}
