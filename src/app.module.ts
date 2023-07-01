import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestingService } from './feature/testing/testing.service';
import { TestingController } from './feature/testing/testing.controller';
import { UsersQueryRepository } from './feature/users/users-query.repository';
import { UsersRepository } from './feature/users/users.repository';
import { UsersService } from './feature/users/users.service';
import { UsersController } from './feature/users/users.controller';
import { User, UserSchema } from './feature/users/user.schema';
import { Post, PostSchema } from './feature/posts/post.schema';
import { Blog, BlogSchema } from './feature/blogs/blog.schema';
import { PostsController } from './feature/posts/posts.controller';
import { PostsService } from './feature/posts/posts.service';
import { PostsRepository } from './feature/posts/posts.repository';
import { PostsQueryRepository } from './feature/posts/posts-query.repository';
import { CommentsController } from './feature/comments/comments.controller';
import { CommentsService } from './feature/comments/comments.service';
import { CommentsRepository } from './feature/comments/comments.repository';
import { CommentsQueryRepository } from './feature/comments/comments-query.repository';
import { BlogsController } from './feature/blogs/blogs.controller';
import { BlogsService } from './feature/blogs/blogs.service';
import { BlogsRepository } from './feature/blogs/blogs.repository';
import { BlogsQueryRepository } from './feature/blogs/blogs-query.repository';
import { Comment, CommentSchema } from './feature/comments/comment.schema';
import { AuthConfig } from './feature/auth/configuration/auth.configuration';
import { BasicStategy } from './feature/auth/strategies/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SecurityDevicesService } from './feature/security-devices/security-devices.service';
import { SecurityDevicesRepository } from './feature/security-devices/security-devices.repository';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './feature/security-devices/security-devices.schema';
import { AuthController } from './feature/auth/auth.controller';
import { AuthService } from './feature/auth/auth.service';
import { AccessJwtStrategy } from './feature/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from './feature/auth/strategies/jwt-refresh.strategy';
import { SecurityDevicesController } from './feature/security-devices/security-device.controller';
import { SecurityDevicesQueryRepository } from './feature/security-devices/security-devices -query.repository';
import { LikePostsRepository } from './feature/posts/like-posts.repository';
import { LikePosts, LikePostsSchema } from './feature/posts/like-posts.schema';
import {
  LikeComments,
  LikeCommentsSchema,
} from './feature/comments/like-comments.schema';
import { LikePostsService } from './feature/posts/like-posts.service';
import { LikeCommentsService } from './feature/comments/like-comments.service';
import { LikeCommentsRepository } from './feature/comments/like-comments.repository';
import { UsersConfig } from './feature/users/configuration/users.configuration';
import { EmailManagerService } from './feature/email-managers/email-manager.service';
import { EmailConfig } from './infrastructure/configuration/email.configuration';
import { EmailAdapter } from './infrastructure/email-adapter';
import { AppConfig } from './configuration/app.configuration';
import { MongooseConfigService } from './configuration/mongouse-service.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: SecurityDevices.name, schema: SecurityDevicesSchema },
      { name: LikePosts.name, schema: LikePostsSchema },
      { name: LikeComments.name, schema: LikeCommentsSchema },
    ]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    PostsController,
    CommentsController,
    BlogsController,
    AuthController,
    SecurityDevicesController,
  ],
  providers: [
    AppService,
    AppConfig,
    TestingService,
    UsersConfig,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    AuthConfig,
    AuthService,
    BasicStategy,
    SecurityDevicesService,
    SecurityDevicesRepository,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    SecurityDevicesQueryRepository,
    LikePostsRepository,
    LikePostsService,
    LikeCommentsService,
    LikeCommentsRepository,
    EmailManagerService,
    EmailConfig,
    EmailAdapter,
  ],
})
export class AppModule {}
