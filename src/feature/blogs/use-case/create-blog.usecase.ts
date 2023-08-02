import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersService } from '../../../feature/users/users.service';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CreateBlogSqlType } from '../model/blog-sql.model';
import { BlogsSqlRepository } from '../db/blogs.sql-repository';

export class CreateBlogCommand {
  constructor(public createDto: CreateBlogDto, public userId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsSqlRepository: BlogsSqlRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultNotification<string>> {
    await validateOrRejectModel(command.createDto, CreateBlogDto);

    const creationResult = new ResultNotification<string>();

    const user = await this.usersService.findUserSqlById(command.userId);
    if (!user) {
      creationResult.addError('User not found', ResultCodeError.NotFound);
      return creationResult;
    }

    const data: CreateBlogSqlType = {
      name: command.createDto.name,
      description: command.createDto.description,
      websiteUrl: command.createDto.websiteUrl,
      ownerId: user.id,
    };

    const newBlog = await this.blogsSqlRepository.createBlog(data);
    if (!newBlog) {
      creationResult.addError('The blog is not created');
    } else {
      creationResult.addData(newBlog.id);
    }
    return creationResult;
  }
}
