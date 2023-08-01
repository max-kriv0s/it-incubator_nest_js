import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestingService } from './feature/testing/testing.service';
import { TestingController } from './feature/testing/testing.controller';
import { UsersQueryRepository } from './feature/users/db/users-query.repository';
import { UsersRepository } from './feature/users/db/users.repository';
import { UsersService } from './feature/users/users.service';
import { UsersController } from './feature/users/users.controller';
import { User, UserSchema } from './feature/users/model/user.schema';
import { Post, PostSchema } from './feature/posts/post.schema';
import { Blog, BlogSchema } from './feature/blogs/model/blog.schema';
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
import { BlogsRepository } from './feature/blogs/db/blogs.repository';
import { BlogsQueryRepository } from './feature/blogs/db/blogs-query.repository';
import { Comment, CommentSchema } from './feature/comments/comment.schema';
import { AuthConfig } from './feature/auth/configuration/auth.configuration';
import { BasicStategy } from './feature/auth/strategies/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SecurityDevicesService } from './feature/security-devices/security-devices.service';
import { SecurityDevicesRepository } from './feature/security-devices/db/security-devices.repository';
import {
  SecurityDevices,
  SecurityDevicesSchema,
} from './feature/security-devices/model/security-devices.schema';
import { AuthController } from './feature/auth/auth.controller';
import { AuthService } from './feature/auth/auth.service';
import { AccessJwtStrategy } from './feature/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from './feature/auth/strategies/jwt-refresh.strategy';
import { SecurityDevicesController } from './feature/security-devices/security-device.controller';
import { SecurityDevicesQueryRepository } from './feature/security-devices/db/security-devices -query.repository';
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
import { ThrottlerBehindProxyGuard } from './guard/throttler-behind-proxy.guard';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApiCallsConfig } from './feature/api-calls/configuration/api-calls.configuration';
import { ApiCallsRepository } from './feature/api-calls/api-calls.repository';
import { ApiCallsService } from './feature/api-calls/api-calls.service';
import { ApiCallSchema, ApiCalls } from './feature/api-calls/api-calls.schema';
import { ThrottlerConfigService } from './guard/throttler-api-calls.configuration';
import { OptionalJwtTokenGuard } from './feature/auth/guard/optional-jwt-token.guard';
import { BlogExistsRule } from './feature/posts/validators/blog-exists.validator';
import { BloggersController } from './feature/bloggers/bloggers.controller';
import { BloggerQueryRepository } from './feature/bloggers/db/blogger-query.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersBlogsController } from './feature/users/users-blogs.controller';
import { UsersBlogsQueryRepository } from './feature/users/db/users-blogs-query.repository';
import { CreateBlogUseCase } from './feature/blogs/use-case/create-blog.usecase';
import { DeletePostByIdUseCase } from './feature/bloggers/use-case/delete-post-by-id.usecase';
import { UpdatePostByIdUseCase } from './feature/bloggers/use-case/update-post-by-id.usecase';
import { CreatePostByBlogIdUseCase } from './feature/blogs/use-case/create-post-by-blog-id.usecase';
import { DeleteBlogByIdUseCase } from './feature/blogs/use-case/delete-blog-by-id.usecase';
import { SetBanUnbanBlogsUseCase } from './feature/blogs/use-case/set-ban-unbane-blogs.usecase';
import { UpdateExistingBlogByIdUseCase } from './feature/blogs/use-case/update-existing-blog-by-id.usecase';
import { CountLikesCommentsUseCase } from './feature/comments/use-case/count-likes-comments.usecase';
import { SetBanUnbanCommentsUseCase } from './feature/comments/use-case/set-ban-unbane-comments.usecase';
import { CountLikesPostsUseCase } from './feature/posts/use-case/count-likes-post.usecase';
import { DeleteAllDevicesByUsersIdUseCase } from './feature/security-devices/use-case/delete-all-devices-by-user-id.usecase';
import { BanUnbanUserUseCase } from './feature/users/use-case/ban-unban-user.usercase';
import { BindBlogWithUserUseCase } from './feature/users/use-case/bind-blog-with-user.usecase';
import { BloggerBanUnbanUserUseCase } from './feature/bloggers/use-case/blogger-ban-unban-user.usecase';
import { BloggersRepository } from './feature/bloggers/db/bloggers.repository';
import {
  BloggerBannedUsers,
  BloggerBannedUsersSchema,
} from './feature/bloggers/model/blogger-banned-users.schema';
import { UserBanUnbanBlogUseCase } from './feature/users/use-case/user-ban-unban-blog.usecase';
import { BloggersUsersController } from './feature/bloggers/bloggers-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmServiceConfiguration } from './configuration/typeorm-service.configuration';
import { UsersSqlRepository } from './feature/users/db/users.sql-repository';
import { CreateUserUseCase } from './feature/users/use-case/create-user.usecase';
import { UsersQuerySqlRepository } from './feature/users/db/users-query.sql-repository';
import { DeleteUserUseCase } from './feature/users/use-case/delete-user.usecase';
import { SecurityDevicesSqlRepository } from './feature/security-devices/db/security-devices.sql-repository';
import { SecurityDevicesQuerySqlRepository } from './feature/security-devices/db/security-devices -query.sql-repository';
import { BlogsSqlRepository } from './feature/blogs/db/blogs.sql-repository';
import { BloggerQuerySqlRepository } from './feature/bloggers/db/blogger-query.sql-repository';

const apiCallsAdapters = [ApiCallsConfig, ApiCallsService, ApiCallsRepository];
const authAdapters = [
  AuthConfig,
  AuthService,
  BasicStategy,
  AccessJwtStrategy,
  RefreshJwtStrategy,
];
const bloggersAdapters = [
  BloggerQueryRepository,
  BloggersRepository,
  BloggerQuerySqlRepository,
];
const blogsAdapters = [
  BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
  BlogExistsRule,
  BlogsSqlRepository,
];
const commentsAdapters = [
  CommentsService,
  CommentsRepository,
  CommentsQueryRepository,
  LikeCommentsService,
  LikeCommentsRepository,
];
const postsAdapters = [
  PostsService,
  PostsRepository,
  PostsQueryRepository,
  LikePostsRepository,
  LikePostsService,
];
const securityDevicesAdapters = [
  SecurityDevicesService,
  SecurityDevicesRepository,
  SecurityDevicesQueryRepository,
  SecurityDevicesSqlRepository,
  SecurityDevicesQuerySqlRepository,
];
const usersAdapters = [
  UsersConfig,
  UsersService,
  UsersConfig,
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersBlogsQueryRepository,
  UsersRepository,
  UsersSqlRepository,
  UsersQuerySqlRepository,
];

const useCases = [
  CreateBlogUseCase,
  DeletePostByIdUseCase,
  UpdatePostByIdUseCase,
  CreatePostByBlogIdUseCase,
  DeleteBlogByIdUseCase,
  SetBanUnbanBlogsUseCase,
  UpdateExistingBlogByIdUseCase,
  CountLikesCommentsUseCase,
  SetBanUnbanCommentsUseCase,
  CountLikesPostsUseCase,
  DeleteAllDevicesByUsersIdUseCase,
  BanUnbanUserUseCase,
  BindBlogWithUserUseCase,
  BloggerBanUnbanUserUseCase,
  UserBanUnbanBlogUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
];

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
      { name: ApiCalls.name, schema: ApiCallSchema },
      { name: BloggerBannedUsers.name, schema: BloggerBannedUsersSchema },
    ]),
    PassportModule,
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, AppModule],
      inject: [ConfigService, ApiCallsConfig],
      useClass: ThrottlerConfigService,
    }),
    CqrsModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmServiceConfiguration,
    }),
  ],
  controllers: [
    AppController,
    TestingController,
    UsersController,
    UsersBlogsController,
    PostsController,
    CommentsController,
    BlogsController,
    AuthController,
    SecurityDevicesController,
    BloggersController,
    BloggersUsersController,
  ],
  providers: [
    AppService,
    AppConfig,
    TestingService,
    ...apiCallsAdapters,
    ...authAdapters,
    ...bloggersAdapters,
    ...blogsAdapters,
    ...commentsAdapters,
    ...postsAdapters,
    ...securityDevicesAdapters,
    ...usersAdapters,
    EmailManagerService,
    EmailConfig,
    EmailAdapter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OptionalJwtTokenGuard,
    },
    ...useCases,
  ],
  exports: [ApiCallsConfig],
})
export class AppModule {}
