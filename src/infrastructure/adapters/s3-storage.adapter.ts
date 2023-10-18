import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { YandexCloudBacketConfig } from '../../configuration/yandex-cloud-backet.configuration';
import { BlogFileTypeEnum } from '../../feature/blogs/enums/blog-file-type.enum';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SizePhotoEnum } from 'src/modules/enums/size-photo.enum';

@Injectable()
export class S3StorageAdapter {
  private s3Client: S3Client;
  private bucketName: string;
  private settings;

  constructor(private readonly yandexCloudConfig: YandexCloudBacketConfig) {
    this.settings = yandexCloudConfig.getSettings();
    this.bucketName = this.settings.YANDEX_CLOUD_BUCKET_NAME;

    const REGION = 'ru-central1';
    this.s3Client = new S3Client({
      region: REGION,
      endpoint: this.settings.YANDEX_CLOUD_URL,
      credentials: {
        secretAccessKey: this.settings.YANDEX_CLOUD_SECRET_KEY,
        accessKeyId: this.settings.YANDEX_CLOUD_KEY_ID,
      },
    });
  }

  async saveBlogPhoto(
    blogId: number,
    format: string,
    buffer: Buffer,
    fileType: BlogFileTypeEnum,
  ) {
    const key = `content/blogs/${blogId}/${fileType}/${fileType}.${format}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: `image/${format}`,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);

      return {
        url: key,
        fileId: uploadResult.ETag,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async savePostImage(
    postId: number,
    format: string,
    buffer: Buffer,
    imageSize: SizePhotoEnum,
  ) {
    const key = `content/posts/${postId}/${imageSize}/${imageSize}.${format}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: `image/${format}`,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);

      return {
        url: key,
        fileId: uploadResult.ETag,
      };
    } catch (exception) {
      console.error(exception);
      throw exception;
    }
  }

  async getSecretUrl(fileId: string) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: fileId,
      Body: 'BODY',
      GetObjectCommand,
    };

    const command = new GetObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 20,
    });

    return signedUrl;
  }

  getUrlFile(url: string) {
    return `${this.settings.YANDEX_CLOUD_URL_FILES}/${url}`;
  }
}
