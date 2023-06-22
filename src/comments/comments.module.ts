import { Module, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommetsRepository } from './comments.repository';
import { CommentsQueryRepository } from './comments-query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { PostSchema } from 'src/posts/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommetsRepository, CommentsQueryRepository],
  exports: [CommetsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
