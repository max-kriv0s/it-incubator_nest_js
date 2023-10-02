import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { CreateUserDto } from '../src/feature/users/dto/create-user.dto';
import { randomString } from './utils/utils-for-tests';
import { BanUnbanUserDto } from '../src/feature/users/dto/ban-unban-user.dto';

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
    await app.close();
  });

  const BASIC_AUTH =
    'Basic ' +
    Buffer.from(
      `${process.env.BASIC_AUTH_USERNAME}:${process.env.BASIC_AUTH_PASSWORD}`,
    ).toString('base64');

  const USERS_URL = '/sa/users';

  describe('Create new user to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/sa/users (POST) - create the user with correct data', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      expect(body).toEqual({
        id: expect.any(String),
        login: mockUser.login,
        email: mockUser.email,
        createdAt: expect.any(String),
        // banInfo: {
        //   isBanned: false,
        //   banDate: null,
        //   banReason: null,
        // },
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
        .post(USERS_URL)
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
        .post(USERS_URL)
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
        .post(USERS_URL)
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
        .post(USERS_URL)
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

    let createdId: string;

    it('/sa/users (POST) - create the user', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      createdId = body.id;
      return body;
    });

    it('/sa/users (DELETE) - user by ID with correct id', async () => {
      return request(app.getHttpServer())
        .delete(USERS_URL + '/' + createdId)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/sa/users (DELETE) - user authorization error', async () => {
      return request(app.getHttpServer())
        .delete(USERS_URL + '/' + createdId)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/users (DELETE) - user by ID with incorrect id', async () => {
      return request(app.getHttpServer())
        .delete(USERS_URL + '/' + (Number(createdId) + 1).toString())
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Ban/unban user', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    let newUser;
    it('/sa/users (POST) - create the user', async () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      const { body } = await request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED);

      newUser = body;
      return body;
    });

    it('/sa/users (PUT) - ban/unban user authorization error', async () => {
      const mockDto: BanUnbanUserDto = {
        isBanned: true,
        banReason: randomString(20),
      };

      return request(app.getHttpServer())
        .put(`${USERS_URL}/${newUser.id}/ban`)
        .send(mockDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/users (PUT) - ban/unban user with incorrect isBanned', async () => {
      const mockDto = {
        isBanned: 'true',
        banReason: randomString(20),
      };

      const { body } = await request(app.getHttpServer())
        .put(`${USERS_URL}/${newUser.id}/ban`)
        .set('Authorization', BASIC_AUTH)
        .send(mockDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'isBanned',
          },
        ],
      });
    });

    it('/sa/users (PUT) - ban/unban user with incorrect banReason', async () => {
      const mockDto = {
        isBanned: true,
        banReason: randomString(10),
      };

      const { body } = await request(app.getHttpServer())
        .put(`${USERS_URL}/${newUser.id}/ban`)
        .set('Authorization', BASIC_AUTH)
        .send(mockDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'banReason',
          },
        ],
      });
    });

    it('/sa/users (PUT) - ban/unban user with correct data ban', async () => {
      const mockDto = {
        isBanned: true,
        banReason: randomString(20),
      };

      await request(app.getHttpServer())
        .put(`${USERS_URL}/${newUser.id}/ban`)
        .set('Authorization', BASIC_AUTH)
        .send(mockDto)
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer())
        .get(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      const user = body.items[0];
      expect(user).toEqual({
        id: newUser.id,
        login: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
        // banInfo: {
        //   isBanned: true,
        //   banDate: expect.any(String),
        //   banReason: expect.any(String),
        // },
      });
    });

    it('/sa/users (PUT) - ban/unban user with correct data unban', async () => {
      const mockDto = {
        isBanned: false,
        banReason: randomString(20),
      };

      await request(app.getHttpServer())
        .put(`${USERS_URL}/${newUser.id}/ban`)
        .set('Authorization', BASIC_AUTH)
        .send(mockDto)
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer())
        .get(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      const user = body.items[0];
      expect(user).toEqual({
        id: newUser.id,
        login: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
        // banInfo: {
        //   isBanned: false,
        //   banDate: null,
        //   banReason: null,
        // },
      });
    });
  });

  describe('return all users', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('sa/users (GET) - return all users authorization error', async () => {
      return request(app.getHttpServer())
        .get(USERS_URL)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    let newUser1;
    let newUser2;

    it('sa/users (POST) - create user 1', () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      return request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          newUser1 = body;
        });
    });

    it('sa/users (POST) - create user 2', () => {
      const mockUser: CreateUserDto = {
        login: randomString(7),
        password: randomString(15),
        email: 'user@user.com',
      };

      return request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockUser)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          newUser2 = body;
        });
    });

    it('sa/users (GET) - return all users success', () => {
      return request(app.getHttpServer())
        .get(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: [
              {
                id: newUser2.id,
                login: newUser2.login,
                email: newUser2.email,
                createdAt: newUser2.createdAt,
                // banInfo: {
                //   isBanned: newUser2.banInfo.isBanned,
                //   banDate: newUser2.banInfo.banDate,
                //   banReason: newUser2.banInfo.banReason,
                // },
              },
              {
                id: newUser1.id,
                login: newUser1.login,
                email: newUser1.email,
                createdAt: newUser1.createdAt,
                // banInfo: {
                //   isBanned: newUser1.banInfo.isBanned,
                //   banDate: newUser1.banInfo.banDate,
                //   banReason: newUser1.banInfo.banReason,
                // },
              },
            ],
          });
        });
    });
  });
});
