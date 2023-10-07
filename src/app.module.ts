import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TestingService } from './feature/testing/testing.service';
import { TestingController } from './feature/testing/testing.controller';
import { UsersService } from './feature/users/users.service';
import { UsersController } from './feature/users/users.controller';
import { PostsController } from './feature/posts/posts.controller';
import { CommentsController } from './feature/comments/comments.controller';
import { BlogsController } from './feature/blogs/blogs.controller';
import { BlogsService } from './feature/blogs/blogs.service';
import { AuthConfig } from './feature/auth/configuration/auth.configuration';
import { BasicStategy } from './feature/auth/strategies/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SecurityDevicesService } from './feature/security-devices/security-devices.service';
import { AuthController } from './feature/auth/auth.controller';
import { AuthService } from './feature/auth/auth.service';
import { AccessJwtStrategy } from './feature/auth/strategies/jwt.strategy';
import { RefreshJwtStrategy } from './feature/auth/strategies/jwt-refresh.strategy';
import { SecurityDevicesController } from './feature/security-devices/security-device.controller';
import { UsersConfig } from './feature/users/configuration/users.configuration';
import { EmailManagerService } from './feature/email-managers/email-manager.service';
import { EmailConfig } from './infrastructure/configuration/email.configuration';
import { EmailAdapter } from './infrastructure/email-adapter';
import { AppConfig } from './configuration/app.configuration';
import { ThrottlerBehindProxyGuard } from './guard/throttler-behind-proxy.guard';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApiCallsConfig } from './feature/api-calls/configuration/api-calls.configuration';
import { ThrottlerConfigService } from './guard/throttler-api-calls.configuration';
import { OptionalJwtTokenGuard } from './feature/auth/guard/optional-jwt-token.guard';
import { BlogExistsRule } from './feature/posts/validators/blog-exists.validator';
import { BloggersController } from './feature/bloggers/bloggers.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersBlogsController } from './feature/users/users-blogs.controller';
import { CreateBlogUseCase } from './feature/blogs/use-case/create-blog.usecase';
import { DeletePostByIdUseCase } from './feature/bloggers/use-case/delete-post-by-id.usecase';
import { UpdatePostByIdUseCase } from './feature/bloggers/use-case/update-post-by-id.usecase';
import { CreatePostByBlogIdUseCase } from './feature/blogs/use-case/create-post-by-blog-id.usecase';
import { DeleteBlogByIdUseCase } from './feature/blogs/use-case/delete-blog-by-id.usecase';
import { UpdateExistingBlogByIdUseCase } from './feature/blogs/use-case/update-existing-blog-by-id.usecase';
import { DeleteAllDevicesByUsersIdUseCase } from './feature/security-devices/use-case/delete-all-devices-by-user-id.usecase';
import { BanUnbanUserUseCase } from './feature/users/use-case/ban-unban-user.usercase';
import { BindBlogWithUserUseCase } from './feature/users/use-case/bind-blog-with-user.usecase';
import { BloggerBanUnbanUserUseCase } from './feature/bloggers/use-case/blogger-ban-unban-user.usecase';
import { UserBanUnbanBlogUseCase } from './feature/users/use-case/user-ban-unban-blog.usecase';
import { BloggersUsersController } from './feature/bloggers/bloggers-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPE_ORM_CONFIGURATION } from './configuration/typeorm-service.configuration';
import { UsersSqlRepository } from './feature/users/db/users.sql-repository';
import { CreateUserUseCase } from './feature/users/use-case/create-user.usecase';
import { UsersQuerySqlRepository } from './feature/users/db/users-query.sql-repository';
import { DeleteUserUseCase } from './feature/users/use-case/delete-user.usecase';
import { SecurityDevicesSqlRepository } from './feature/security-devices/db/security-devices.sql-repository';
import { SecurityDevicesQuerySqlRepository } from './feature/security-devices/db/security-devices -query.sql-repository';
import { BlogsSqlRepository } from './feature/blogs/db/blogs.sql-repository';
import { BloggerQuerySqlRepository } from './feature/bloggers/db/blogger-query.sql-repository';
import { PostsSqlRepository } from './feature/posts/db/posts.sql-repository';
import { BloggersSqlRepository } from './feature/bloggers/db/bloggers.sql-repository';
import { UsersBlogsQuerySqlRepository } from './feature/users/db/users-blogs-query.sql-repository';
import { BlogsQuerySqlRepository } from './feature/blogs/db/blogs-query.sql-repository';
import { PostsQuerySqlRepository } from './feature/posts/db/posts-query.sql-repository';
import { CreateCommentByPostIdUseCase } from './feature/posts/use-case/create-comment-by-post-id.usecase';
import { CommentsSqlRepository } from './feature/comments/db/comments.sql-repository';
import { CommentsQuerySqlRepository } from './feature/comments/db/comments-query.sql-repository';
import { LikePostsSqlRepository } from './feature/posts/db/like-posts.sql-repository';
import { LikeCommentsSqlRepository } from './feature/comments/db/like-comments.sql-repository';
import { LikeStatusByPostIdUseCase } from './feature/posts/use-case/like-status-by-post-id.usecase';
import { DeleteCommentbyIdUseCase } from './feature/comments/use-case/delete-comment-by-id.usecase';
import { UpdateCommentByIdUseCase } from './feature/comments/use-case/update-comment-by-id.usecase';
import { SetLikeStatusByCommentIdUseCase } from './feature/comments/use-case/set-like-status-by-comment-id.usecase';
import { User } from './feature/users/entities/user.entity';
import { Blog } from './feature/blogs/entities/blog.entity';
import { Post } from './feature/posts/entities/post.entity';
import { Comment } from './feature/comments/entities/comment.entity';
import { SecurityDevice } from './feature/security-devices/entities/security-device.entity';
import { BloggerBannedUser } from './feature/bloggers/entities/blogger-banned-user.entity';
import { CommentLike } from './feature/comments/entities/comment-likes.entity';
import { PostLike } from './feature/posts/entities/post-like.entity';
import { UsersRepository } from './feature/users/db/users.repository';
import { UsersQueryRepository } from './feature/users/db/users-query.repository';
import { SecurityDevicesRepository } from './feature/security-devices/db/security-devices.repository';
import { SecurityDevicesQueryRepository } from './feature/security-devices/db/security-devices -query.repository';
import { PostsRepository } from './feature/posts/db/posts.repository';
import { UsersBlogsQueryRepository } from './feature/users/db/users-blogs-query.repository';
import { BlogsRepository } from './feature/blogs/db/blogs.repository';
import { CommentsRepository } from './feature/comments/db/comments.repository';
import { LikePostsRepository } from './feature/posts/db/like-posts.repository';
import { LikeCommentsRepository } from './feature/comments/db/like-comments.repository';
import { BloggerQueryRepository } from './feature/bloggers/db/blogger-query.repository';
import { PostsQueryRepository } from './feature/posts/db/posts-query.repository';
import { BloggersRepository } from './feature/bloggers/db/bloggers.repository';
import { BlogsQueryRepository } from './feature/blogs/db/blogs-query.repository';
import { CommentsQueryRepository } from './feature/comments/db/comments-query.repository';
import { Question } from './feature/questions/entities/question.entity';
import { QuestionsRepository } from './feature/questions/db/questions.repository';
import { QuestionsController } from './feature/questions/questions.controller';
import { CreateQuestionUseCase } from './feature/questions/use-case/create-question.usecase';
import { QuestionDeleteUseCase } from './feature/questions/use-case/question-delete.usecase';
import { QuestionUpdateUseCase } from './feature/questions/use-case/question-update.usecase';
import { QuestionsQueryRepository } from './feature/questions/db/questions-query.repository';
import { QuestionPublishUnpublishUseCase } from './feature/questions/use-case/question-publish-unpublish.usecase';
import { PairQuizGame } from './feature/pair-quiz-game/entities/pair-quiz-game.entity';
import { PairQuizGameProgress } from './feature/pair-quiz-game/entities/pair-quiz-game-progress.entity';
import { PairQuizGameController } from './feature/pair-quiz-game/pair-quiz-game.controller';
import { PairQuizGameQueryRepository } from './feature/pair-quiz-game/db/pair-quiz-game-query.repository';
import { PairQuizGameRepository } from './feature/pair-quiz-game/db/pair-quiz-game.repository';
import { CreatePairQuizGameUseCase } from './feature/pair-quiz-game/use-case/create-pair-quiz-game.usecase';
import { PairQuizGameProgressRepository } from './feature/pair-quiz-game/db/pair-quiz-game-progress.repository';
import { AnswerPairQuizGameUseCase } from './feature/pair-quiz-game/use-case/answer-pair-quiz-game.usecase';
import { PairQuizGameProgressQueryRepository } from './feature/pair-quiz-game/db/pair-quiz-game-progress-query.repository';
import { PairQuizGameUsersController } from './feature/pair-quiz-game/pair-quiz-game-users.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { PairQuizGameService } from './feature/pair-quiz-game/pair-quiz-game.service';

const apiCallsAdapters = [
  ApiCallsConfig,
  // ApiCallsService, ApiCallsRepository
];
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
  BloggersSqlRepository,
];
const blogsAdapters = [
  BlogsService,
  BlogsRepository,
  BlogsQueryRepository,
  BlogExistsRule,
  BlogsSqlRepository,
  BlogsQuerySqlRepository,
];
const commentsAdapters = [
  // CommentsService,
  CommentsRepository,
  CommentsQueryRepository,
  // LikeCommentsService,
  LikeCommentsRepository,
  CommentsSqlRepository,
  CommentsQuerySqlRepository,
  LikeCommentsSqlRepository,
];
const postsAdapters = [
  // PostsService,
  PostsRepository,
  PostsQueryRepository,
  LikePostsRepository,
  // LikePostsService,
  PostsSqlRepository,
  PostsQuerySqlRepository,
  LikePostsSqlRepository,
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
  UsersRepository,
  UsersQueryRepository,
  UsersBlogsQueryRepository,
  UsersSqlRepository,
  UsersQuerySqlRepository,
  UsersBlogsQuerySqlRepository,
  LikeStatusByPostIdUseCase,
];
const PairQuizGameAdapters = [
  PairQuizGameRepository,
  PairQuizGameQueryRepository,
  PairQuizGameProgressRepository,
  PairQuizGameProgressQueryRepository,
  PairQuizGameService,
];
const QuestionsAdapters = [QuestionsRepository, QuestionsQueryRepository];
const useCases = [
  CreateBlogUseCase,
  DeletePostByIdUseCase,
  UpdatePostByIdUseCase,
  CreatePostByBlogIdUseCase,
  DeleteBlogByIdUseCase,
  UpdateExistingBlogByIdUseCase,
  // CountLikesCommentsUseCase,
  // SetBanUnbanCommentsUseCase,
  // CountLikesPostsUseCase,
  DeleteAllDevicesByUsersIdUseCase,
  BanUnbanUserUseCase,
  BindBlogWithUserUseCase,
  BloggerBanUnbanUserUseCase,
  UserBanUnbanBlogUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  CreateCommentByPostIdUseCase,
  DeleteCommentbyIdUseCase,
  UpdateCommentByIdUseCase,
  SetLikeStatusByCommentIdUseCase,
  CreateQuestionUseCase,
  QuestionDeleteUseCase,
  QuestionUpdateUseCase,
  QuestionPublishUnpublishUseCase,
  CreatePairQuizGameUseCase,
  AnswerPairQuizGameUseCase,
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
    // MongooseModule.forRootAsync({
    //   useClass: MongooseConfigService,
    // }),
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: Post.name, schema: PostSchema },
    //   { name: Blog.name, schema: BlogSchema },
    //   { name: Comment.name, schema: CommentSchema },
    //   { name: SecurityDevices.name, schema: SecurityDevicesSchema },
    //   { name: LikePosts.name, schema: LikePostsSchema },
    //   { name: LikeComments.name, schema: LikeCommentsSchema },
    //   { name: ApiCalls.name, schema: ApiCallSchema },
    //   { name: BloggerBannedUsers.name, schema: BloggerBannedUsersSchema },
    // ]),
    PassportModule,
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, AppModule],
      inject: [ConfigService, ApiCallsConfig],
      useClass: ThrottlerConfigService,
    }),
    CqrsModule,
    TypeOrmModule.forRoot(TYPE_ORM_CONFIGURATION),
    // TypeOrmModule.forRootAsync({
    //   useClass: TypeOrmServiceConfiguration,
    // }),
    TypeOrmModule.forFeature([
      User,
      Blog,
      Post,
      Comment,
      SecurityDevice,
      BloggerBannedUser,
      CommentLike,
      PostLike,
      Question,
      PairQuizGame,
      PairQuizGameProgress,
    ]),
    ScheduleModule.forRoot(),
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
    QuestionsController,
    PairQuizGameController,
    PairQuizGameUsersController,
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
    ...QuestionsAdapters,
    ...PairQuizGameAdapters,
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
