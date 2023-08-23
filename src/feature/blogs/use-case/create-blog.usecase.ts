import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersService } from '../../../feature/users/users.service';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { CreateBlogSqlType } from '../model/blog-sql.model';
import { BlogsRepository } from '../db/blogs.repository';
import { UsersRepository } from '../../../feature/users/db/users.repository';
import { Blog } from '../entities/blog.entity';

export class CreateBlogCommand {
  constructor(public createDto: CreateBlogDto, public userId: number) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultNotification<number>> {
    await validateOrRejectModel(command.createDto, CreateBlogDto);

    const creationResult = new ResultNotification<number>();

    const user = await this.usersRepository.findUserById(+command.userId);
    if (!user) {
      creationResult.addError('User not found', ResultCodeError.NotFound);
      return creationResult;
    }

    const newBlog = new Blog();
    newBlog.name = command.createDto.name;
    newBlog.description = command.createDto.description;
    newBlog.websiteUrl = command.createDto.websiteUrl;
    newBlog.ownerId = user.id;
    await this.blogsRepository.createBlog(newBlog);

    creationResult.addData(newBlog.id);
    return creationResult;
  }
}
