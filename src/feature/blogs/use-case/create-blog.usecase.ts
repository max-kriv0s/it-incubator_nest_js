import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { validateOrRejectModel } from '../../../modules/validation';
import { UsersService } from '../../../feature/users/users.service';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../blogs.repository';
import { CreateUserBlockDto } from '../model/blog.schema';

export class CreateBlogCommand {
  constructor(public createDto: CreateBlogDto, public userId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: CreateBlogCommand,
  ): Promise<ResultNotification<string>> {
    await validateOrRejectModel(command.createDto, CreateBlogDto);

    const result = new ResultNotification<string>();

    const user = await this.usersService.findUserById(command.userId);
    if (!user) {
      result.addError('User not found', ResultCodeError.NotFound);
      return result;
    }

    const data: CreateUserBlockDto = {
      name: command.createDto.name,
      description: command.createDto.description,
      websiteUrl: command.createDto.websiteUrl,
      blogOwner: {
        userId: user._id,
        userLogin: user.accountData.login,
      },
    };

    const newBlog = this.blogsRepository.createBlog(data);
    await this.blogsRepository.save(newBlog);

    result.addData(newBlog.id);
    return result;
  }
}
