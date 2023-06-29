import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from './comment.schema';
import { Types } from 'mongoose';
import { PaginatorCommentView, ViewCommentDto } from './dto/view-comment.dto';
import { QueryParams } from '../../dto';
import { validID } from '../../utils';
import { LikeStatus } from '../likes/dto/like-status';
import { Post, PostModelType } from '../posts/post.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async findCommentsByPostId(
    postId: string,
    queryParams: QueryParams,
    userId?: string,
  ): Promise<PaginatorCommentView | null> {
    const pageNumber: number = +queryParams.pageNumber || 1;
    const pageSize: number = +queryParams.pageSize || 10;
    const sortBy: string = queryParams.sortBy || 'createdAt';
    const sortDirection = queryParams.sortDirection || 'desc';

    const post = await this.PostModel.findById(postId).exec();
    if (!post) return null;

    const filter = { postId: new Types.ObjectId(postId) };
    const totalCount: number = await this.CommentModel.countDocuments(filter);

    const skip = (pageNumber - 1) * pageSize;
    const comments = await this.CommentModel.find(filter, null, {
      sort: { [sortBy]: sortDirection === 'asc' ? 1 : -1 },
      skip: skip,
      limit: pageSize,
    }).exec();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        comments.map((comment) => this.commentDBToCommentView(comment, userId)),
      ),
    };
  }

  async getCommentViewById(
    id: string,
    userId?: string,
  ): Promise<ViewCommentDto | null> {
    const comment = await this.CommentModel.findById(id).exec();
    if (!comment) return null;

    return this.commentDBToCommentView(comment, userId);
  }

  async commentDBToCommentView(
    comment: CommentDocument,
    userId?: string,
  ): Promise<ViewCommentDto> {
    const statusMyLike = LikeStatus.None;

    if (userId) {
      //   const myLike = await LikeModel.findOne({
      //     commentId: comment._id,
      //     userId: new Types.ObjectId(userId),
      //   }).exec();
      //   if (myLike) statusMyLike = myLike.status;
    }

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId.toString(),
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: statusMyLike,
      },
    };
  }
}
