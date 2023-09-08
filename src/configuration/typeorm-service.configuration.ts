import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
config();

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
      autoLoadEntities: false,
      synchronize: false,
      ssl: process.env.TYPE_ORM_TYPE_SERVER === 'local' ? false : true,
      logging: ['error'],
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      // entities: ['../*.entity.ts'],
      // migrations: ['../migrations/*.ts'],
    };
  }
}

export const TYPE_ORM_CONFIG: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.TYPE_ORM_HOST,
  port: Number(process.env.TYPE_ORM_PORT),
  username: process.env.TYPE_ORM_USERNAME,
  password: process.env.TYPE_ORM_PASSWORD,
  database: process.env.TYPE_ORM_DATABASE,
  synchronize: false,
  ssl: process.env.TYPE_ORM_TYPE_SERVER === 'local' ? false : true,
  logging: ['error'],
  // entities: ['../*.entity.ts'],
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../migrations/*.ts'],
};

export const TYPE_ORM_CONFIGURATION: TypeOrmModuleOptions = {
  ...TYPE_ORM_CONFIG,
  autoLoadEntities: false,
  // synchronize: false,
  // ssl: process.env.TYPE_ORM_TYPE_SERVER === 'local' ? false : true,
  // logging: ['error'],
  // entities:[]
};

export default TYPE_ORM_CONFIG;
