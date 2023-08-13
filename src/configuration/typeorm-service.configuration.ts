import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmServiceConfiguration implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: process.env.TYPE_ORM_HOST,
      port: Number(process.env.TYPE_ORM_PORT),
      username: process.env.TYPE_ORM_USERNAME,
      password: process.env.TYPE_ORM_PASSWORD,
      database: process.env.TYPE_ORM_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.TYPE_ORM_TYPE_SERVER === 'local' ? false : true,
    };
  }
}
