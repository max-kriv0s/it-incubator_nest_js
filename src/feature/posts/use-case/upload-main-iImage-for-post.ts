import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../infrastructure/adapters/s3-storage.adapter';
import {
  ResultCodeError,
  ResultNotification,
} from '../../../modules/notification';
import { ImageInputDto } from '../../../modules/dto/image-input.dto';
import sharp from 'sharp';
import { PostImagesRepository } from '../db/post-images.repository';
import { SizePhotoEnum } from '../../../modules/enums/size-photo.enum';
import { PostPhotosEntity } from '../entities/post-photos.entity';
import { BlogsRepository } from '../../../feature/blogs/db/blogs.repository';
import { PostsRepository } from '../db/posts.repository';

export class UploadMainImageForPostCommand {
  constructor(
    public userId: number,
    public blogId: number,
    public postId: number,
    public imageInputDto: ImageInputDto,
  ) {}
}

@CommandHandler(UploadMainImageForPostCommand)
export class UploadMainImageForPostUseCase
  implements ICommandHandler<UploadMainImageForPostCommand>
{
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogsRepository: BlogsRepository,
    private readonly postImagesRepository: PostImagesRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(
    command: UploadMainImageForPostCommand,
  ): Promise<ResultNotification> {
    const result = new ResultNotification();

    let metadata = await sharp(command.imageInputDto.buffer).metadata();

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

    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) {
      result.addError('Post not found', ResultCodeError.NotFound);
      return result;
    }

    await this.savePostImage(
      command.postId,
      command.imageInputDto.buffer,
      metadata,
      SizePhotoEnum.original,
    );

    const middleBuffer = await sharp(command.imageInputDto.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();
    metadata = await sharp(middleBuffer).metadata();
    await this.savePostImage(
      command.postId,
      middleBuffer,
      metadata,
      SizePhotoEnum.middle,
    );

    const smallBuffer = await sharp(command.imageInputDto.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();
    metadata = await sharp(smallBuffer).metadata();
    await this.savePostImage(
      command.postId,
      smallBuffer,
      metadata,
      SizePhotoEnum.small,
    );

    return result;
  }

  private validateImage(metadata: sharp.Metadata, result: ResultNotification) {
    const availableFileTypes = ['png', 'jpg', 'jpeg'];
    if (!availableFileTypes.includes(metadata.format!)) {
      result.addError('Invalid file type', ResultCodeError.BadRequest, 'file');
      return result;
    }

    if (!(metadata.width! === 940 && metadata.height! === 432)) {
      result.addError('Invalid file', ResultCodeError.BadRequest, 'file');
      return result;
    }
  }

  private async savePostImage(
    postId: number,
    buffer: Buffer,
    metadata: sharp.Metadata,
    imageSize: SizePhotoEnum,
  ) {
    const resultSavedCloud = await this.s3StorageAdapter.savePostImage(
      postId,
      metadata.format!,
      buffer,
      imageSize,
    );

    let image = await this.postImagesRepository.findImageByPostIdAndSizeImage(
      postId,
      imageSize,
    );
    if (!image) {
      image = new PostPhotosEntity();
    }

    image.postId = postId;
    image.url = resultSavedCloud.url;
    image.width = metadata.width!;
    image.height = metadata.height!;
    image.fileSize = metadata.size!;
    image.sizePhoto = imageSize;
    image.storageId = resultSavedCloud.fileId ? resultSavedCloud.fileId : '';
    await this.postImagesRepository.save(image);
  }
}
