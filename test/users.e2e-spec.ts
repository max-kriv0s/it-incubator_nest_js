import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { CreateUserDto } from '../src/feature/users/dto/create-user.dto';
import { randomString } from './utils/utils-for-tests';

describe('UsersController (e2e) test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  const BASIC_AUTH =
    'Basic ' +
    Buffer.from(
      `${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`,
    ).toString('base64');

  describe('Create new user to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    const CREATE_USERS_URL = '/sa/users';

    it('/sa/users (POST) - create the user with correct data', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      expect(body).toEqual({
        id: expect.any(String),
        login: mockUser.login,
        email: mockUser.email,
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      });

      return body;
    });

    it('/sa/users (POST) - create the user authorization error', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(5),
        password: randomString(10),
        email: 'user@user.com',
      };

      return request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .send(mockUser)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/users (POST) - create the user with incorrect login', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(15),
        password: randomString(10),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });

    it('/sa/users (POST) - create the user with incorrect password', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(25),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });

    it('/sa/users (POST) - create the user with incorrect email', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user',
      };

      const { body } = await request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });
  });

  describe('Delete user to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    const CREATE_USERS_URL = '/sa/users';
    let createdId: string;

    it('/sa/users (POST) - create the user', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(CREATE_USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      createdId = body.id;
      return body;
    });

    it('/sa/users (DELETE) - user by ID with correct id', async () => {
      return request(app.getHttpServer())
        .delete(CREATE_USERS_URL + '/' + createdId)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/sa/users (DELETE) - user authorization error', async () => {
      return request(app.getHttpServer())
        .delete(CREATE_USERS_URL + '/' + createdId)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/users (DELETE) - user by ID with incorrect id', async () => {
      return request(app.getHttpServer())
        .delete(CREATE_USERS_URL + '/' + (Number(createdId) + 1).toString())
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
