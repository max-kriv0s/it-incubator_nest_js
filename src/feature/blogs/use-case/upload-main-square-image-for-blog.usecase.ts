import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../infrastructure/adapters/s3-storage.adapter';
import { BlogFileTypeEnum } from '../enums/blog-file-type.enum';
import { BlogPhotosEntity } from '../entities/blog-photo.entity';
import { BlogPhotosRepository } from '../db/blog-photos.repository';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { BlogsRepository } from '../db/blogs.repository';
import { ImageInputDto } from '../../../modules/dto/image-input.dto';
import sharp from 'sharp';

export class UploadMainSquareImageForBlogCommand {
  constructor(
    public userId: number,
    public blogId: number,
    public imageInputDto: ImageInputDto,
  ) {}
}

@CommandHandler(UploadMainSquareImageForBlogCommand)
export class UploadMainSquareImageForBlogUseCase
  implements ICommandHandler<UploadMainSquareImageForBlogCommand>
{
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogPhotosRepository: BlogPhotosRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(
    command: UploadMainSquareImageForBlogCommand,
  ): Promise<ResultNotification> {
    const result = new ResultNotification();

    const metadata = await sharp(command.imageInputDto.buffer).metadata();

    this.validateImage(metadata, result);
    if (result.hasError()) return result;

    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) {
      result.addError('Blog not found', ResultCodeError.NotFound);
      return result;
    }
    if (blog.ownerId !== command.userId) {
      result.addError('Access denied', ResultCodeError.Forbidden);
      return result;
    }

    const imageType = BlogFileTypeEnum.main;
    const resultSavedCloud = await this.s3StorageAdapter.saveBlogPhoto(
      command.blogId,
      metadata.format!,
      command.imageInputDto.buffer,
      imageType,
    );

    let photo = await this.blogPhotosRepository.findImageByBlogIdAndFileType(
      command.blogId,
      imageType,
    );
    if (!photo) {
      photo = new BlogPhotosEntity();
    }

    photo.blogId = command.blogId;
    photo.url = resultSavedCloud.url;
    photo.width = metadata.width!;
    photo.height = metadata.height!;
    photo.fileSize = metadata.size!;
    photo.fileType = imageType;
    photo.storageId = resultSavedCloud.fileId ? resultSavedCloud.fileId : '';
    await this.blogPhotosRepository.save(photo);

    return result;
  }

  private validateImage(metadata: sharp.Metadata, result: ResultNotification) {
    const availableFileTypes = ['png', 'jpg', 'jpeg'];
    if (!availableFileTypes.includes(metadata.format!)) {
      result.addError('Invalid file type', ResultCodeError.BadRequest, 'file');
      return result;
    }

    if (!(metadata.width! === 156 && metadata.height! === 156)) {
      result.addError('Invalid file', ResultCodeError.BadRequest, 'file');
      return result;
    }
  }
}
