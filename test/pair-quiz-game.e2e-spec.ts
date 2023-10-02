import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { CreateQuestionDto } from '../src/feature/questions/dto/create-question.dto';
import { CreateUserDto } from '../src/feature/users/dto/create-user.dto';
import { GameStatus } from '../src/feature/pair-quiz-game/entities/pair-quiz-game.entity';
import { AnswerStatus } from '../src/feature/pair-quiz-game/entities/pair-quiz-game-progress.entity';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PairQuizGame (e2e) test', () => {
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

  const PGQ_PAIRS_URL = '/pair-game-quiz/pairs';
  const PGQ_USERS_URL = '/pair-game-quiz/users';
  const USERS_URL = '/sa/users';
  const LOGIN_URL = '/auth/login';
  const QUESTIONS_URL = '/sa/quiz/questions';

  describe('Create new game', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    const userDto1: CreateUserDto = {
      login: 'test_user1',
      password: 'test_user1',
      email: 'user@user.com',
    };

    const userDto2: CreateUserDto = {
      login: 'test_user2',
      password: 'test_user2',
      email: 'user@user.com',
    };

    let newUser1;
    let newUser2;
    let tokenUser1;
    let tokenUser2;

    let game;

    it('sa/users (POST) - create user 1', () => {
      return request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(userDto1)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          newUser1 = body;
        });
    });

    it('sa/users (POST) - create user 2', () => {
      return request(app.getHttpServer())
        .post(USERS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(userDto2)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          newUser2 = body;
        });
    });

    it('/sa/quiz/questions (POST) - create 5 questions', async () => {
      for (let i = 1; i <= 5; i++) {
        const mockQuestion: CreateQuestionDto = {
          body: `Test question ${i}`,
          correctAnswers: ['correct answer'],
        };

        const { body } = await request(app.getHttpServer())
          .post(QUESTIONS_URL)
          .set('Authorization', BASIC_AUTH)
          .send(mockQuestion)
          .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
          .put(QUESTIONS_URL + `/${body.id}/publish`)
          .set('Authorization', BASIC_AUTH)
          .send({ published: true })
          .expect(HttpStatus.NO_CONTENT);
      }

      return true;
    });

    it('/auth/login (POST) - login user 1', async () => {
      const { body } = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .set('Authorization', BASIC_AUTH)
        .send({
          loginOrEmail: userDto1.login,
          password: userDto1.password,
        })
        .expect(HttpStatus.OK);

      tokenUser1 = body.accessToken;
      return body;
    });

    it('/auth/login (POST) - login user 2', async () => {
      const { body } = await request(app.getHttpServer())
        .post(LOGIN_URL)
        .set('Authorization', BASIC_AUTH)
        .send({
          loginOrEmail: userDto2.login,
          password: userDto2.password,
        })
        .expect(HttpStatus.OK);

      tokenUser2 = body.accessToken;
      return body;
    });

    it('/pair-game-quiz/pairs/connection (POST) - create new game user 1', async () => {
      const { body } = await request(app.getHttpServer())
        .post(PGQ_PAIRS_URL + '/connection')
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send()
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: { id: newUser1.id, login: newUser1.login },
          score: 0,
        },
        secondPlayerProgress: null,
        questions: null,
        status: GameStatus.PendingSecondPlayer,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
      });

      game = body;
      return body;
    });

    it('/pair-game-quiz/pairs/connection (POST) - user 2 connected to the game', async () => {
      const { body } = await request(app.getHttpServer())
        .post(PGQ_PAIRS_URL + '/connection')
        .set('Authorization', `Bearer ${tokenUser2}`)
        .send()
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: [],
          player: { id: newUser1.id, login: newUser1.login },
          score: 0,
        },
        secondPlayerProgress: {
          answers: [],
          player: { id: newUser2.id, login: newUser2.login },
          score: 0,
        },
        questions: expect.arrayContaining([
          { id: expect.any(String), body: expect.any(String) },
          { id: expect.any(String), body: expect.any(String) },
          { id: expect.any(String), body: expect.any(String) },
          { id: expect.any(String), body: expect.any(String) },
          { id: expect.any(String), body: expect.any(String) },
        ]),
        status: GameStatus.Active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
      });

      return body;
    });

    it('/pair-game-quiz/pairs/my-current/answers (POST) - Send 5 correct answer', async () => {
      for (let i = 0; i < 5; i++) {
        const { body } = await request(app.getHttpServer())
          .post(PGQ_PAIRS_URL + '/my-current/answers')
          .set('Authorization', `Bearer ${tokenUser1}`)
          .send({ answer: 'correct answer' })
          .expect(HttpStatus.OK);

        expect(body).toEqual({
          questionId: expect.any(String),
          answerStatus: AnswerStatus.Correct,
          addedAt: expect.any(String),
        });
      }
    });

    it('pair-game-quiz/pairs/{id} (GET) - The game is completed, the first player was charged 6 points', async () => {
      await sleep(10000);

      const { body } = await request(app.getHttpServer())
        .get(PGQ_PAIRS_URL + `/${game.id}`)
        .set('Authorization', `Bearer ${tokenUser1}`)
        .send()
        .expect(HttpStatus.OK);

      //   expect(body).toHaveProperty('status', GameStatus.Finished);

      expect(body).toMatchObject({
        firstPlayerProgress: { score: 6 },
        secondPlayerProgress: { score: 0 },
        status: GameStatus.Finished,
        finishGameDate: expect.any(String),
      });
    });
  });
});
