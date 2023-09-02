import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { randomString } from './utils/utils-for-tests';
import { CreateQuestionDto } from '../src/feature/questions/dto/create-question.dto';
import { QuestionPublishDto } from '../src/feature/questions/dto/question-publish.dto';

describe('QuestionsController (e2e) test', () => {
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

  const QUESTIONS_URL = '/sa/quiz/questions';

  describe('Create new question to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/sa/quiz/questions (POST) - create the question with correct data', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      expect(body).toEqual({
        id: expect.any(String),
        body: mockQuestion.body,
        correctAnswers: mockQuestion.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      return body;
    });

    it('/sa/quiz/questions (POST) - create the question authorization error', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question',
        correctAnswers: ['test'],
      };

      return request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .send(mockQuestion)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/quiz/questions (POST) - create the question with incorrect minLength body', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: randomString(4),
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions (POST) - create the question with incorrect maxLength body', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: randomString(501),
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions (POST) - create the question with incorrect type body', async () => {
      const mockQuestion = {
        body: 1,
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions (POST) - create the question with incorrect type correctAnswers', async () => {
      const mockQuestion = {
        body: 'Test question',
        correctAnswers: 'test',
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });
    });
  });

  describe('Delete question to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    let createdId: string;

    it('/sa/quiz/questions (POST) - create the question', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      createdId = body.id;
      return body;
    });

    it('/sa/quiz/questions (DELETE) - question by ID with correct id', async () => {
      return request(app.getHttpServer())
        .delete(QUESTIONS_URL + '/' + createdId)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/sa/quiz/questions (DELETE) - question authorization error', async () => {
      return request(app.getHttpServer())
        .delete(QUESTIONS_URL + '/' + createdId)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/quiz/questions (DELETE) - question by ID with incorrect id', async () => {
      return request(app.getHttpServer())
        .delete(QUESTIONS_URL + '/' + (Number(createdId) + 1).toString())
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get questions to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    let question1;
    let question2;

    it('/sa/quiz/questions (GET) - get paginate empty questions', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });

    it('/sa/quiz/questions (GET) - question authorization error', async () => {
      return request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/quiz/questions (POST) - create the question', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question 1',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      question1 = body;
      return body;
    });

    it('/sa/quiz/questions (POST) - create the question', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question 2',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      question2 = body;
      return body;
    });

    it('/sa/quiz/questions (GET) - get paginate all questions', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [question2, question1],
      });
    });

    it('/sa/quiz/questions (GET) - get paginate all questions page size 1 page 1', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .query({ pageSize: 1 })
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 1,
        totalCount: 2,
        items: [question2],
      });
    });

    it('/sa/quiz/questions (GET) - get paginate all questions page size 1 page 2', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .query({ pageSize: 1, pageNumber: 2 })
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 1,
        totalCount: 2,
        items: [question1],
      });
    });

    it('/sa/quiz/questions (GET) - get paginate questions serch body', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .query({ bodySearchTerm: '1' })
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [question1],
      });
    });

    it('/sa/quiz/questions (GET) - get paginate questions sort body asc', async () => {
      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .query({ sortBy: 'body', sortDirection: 'asc' })
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [question1, question2],
      });
    });
  });

  describe('Put question to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    let question1;

    it('/sa/quiz/questions (POST) - create the question', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      question1 = body;
      return body;
    });

    it('/sa/quiz/questions/:id (PUT) - question by ID with correct id', async () => {
      const mockBody = {
        body: 'New test question',
        correctAnswers: ['new test'],
      };

      await request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + question1.id)
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body.items.length).toBe(1);

      expect(body.items[0]).toEqual({
        id: question1.id,
        body: mockBody.body,
        correctAnswers: mockBody.correctAnswers,
        published: question1.published,
        createdAt: question1.createdAt,
        updatedAt: expect.any(String),
      });

      return;
    });

    it('/sa/quiz/questions/:id (PUT) - question authorization error', async () => {
      return request(app.getHttpServer())
        .delete(QUESTIONS_URL + '/' + question1.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/quiz/questions/:id (PUT) - question by ID with incorrect id', async () => {
      const mockBody = {
        body: 'New test question',
        correctAnswers: ['new test'],
      };

      return request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + (Number(question1.id) + 1).toString())
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/sa/quiz/questions/:id (PUT) - update the question with incorrect minLength body', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: randomString(4),
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + question1.id)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions/:id (PUT) - update the question with incorrect maxLength body', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: randomString(501),
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + question1.id)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions/:id (PUT) - update the question with incorrect type body', async () => {
      const mockQuestion = {
        body: 1,
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + question1.id)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'body',
          },
        ],
      });
    });

    it('/sa/quiz/questions/:id (PUT) - update the question with incorrect type correctAnswers', async () => {
      const mockQuestion = {
        body: 'Test question',
        correctAnswers: 'test',
      };

      const { body } = await request(app.getHttpServer())
        .put(QUESTIONS_URL + '/' + question1.id)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'correctAnswers',
          },
        ],
      });
    });
  });

  describe('Put publish question to the system', () => {
    beforeAll(async () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(HttpStatus.NO_CONTENT);
    });

    let question1;

    it('/sa/quiz/questions (POST) - create the question', async () => {
      const mockQuestion: CreateQuestionDto = {
        body: 'Test question',
        correctAnswers: ['test'],
      };

      const { body } = await request(app.getHttpServer())
        .post(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .send(mockQuestion)
        .expect(HttpStatus.CREATED);

      question1 = body;
      return body;
    });

    it('/sa/quiz/questions/:id/publish (PUT) - update question publish true correct data', async () => {
      const mockBody: QuestionPublishDto = {
        published: true,
      };

      await request(app.getHttpServer())
        .put(QUESTIONS_URL + `/${question1.id}/publish`)
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body.items.length).toBe(1);

      expect(body.items[0]).toEqual({
        ...question1,
        published: true,
        updatedAt: expect.any(String),
      });

      return;
    });

    it('/sa/quiz/questions/:id/publish (PUT) - update question publish false correct data', async () => {
      const mockBody: QuestionPublishDto = {
        published: false,
      };

      await request(app.getHttpServer())
        .put(QUESTIONS_URL + `/${question1.id}/publish`)
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.NO_CONTENT);

      const { body } = await request(app.getHttpServer())
        .get(QUESTIONS_URL)
        .set('Authorization', BASIC_AUTH)
        .expect(HttpStatus.OK);

      expect(body.items.length).toBe(1);

      expect(body.items[0]).toEqual({
        ...question1,
        published: false,
        updatedAt: expect.any(String),
      });

      return;
    });

    it('/sa/quiz/questions/:id/publish (PUT) - update question  authorization error', async () => {
      const mockBody: QuestionPublishDto = {
        published: true,
      };

      return request(app.getHttpServer())
        .put(QUESTIONS_URL + `/${question1.id}/publish`)
        .send(mockBody)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/sa/quiz/questions/:id/publish (PUT) - question by ID with incorrect id', async () => {
      const mockBody: QuestionPublishDto = {
        published: true,
      };

      return request(app.getHttpServer())
        .put(
          QUESTIONS_URL + `/${(Number(question1.id) + 1).toString()}/publish`,
        )
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/sa/quiz/questions/:id/publish (PUT) - update the question publish with incorrect data', async () => {
      const mockBody = {
        published: 1,
      };

      const { body } = await request(app.getHttpServer())
        .put(QUESTIONS_URL + `/${question1.id}/publish`)
        .set('Authorization', BASIC_AUTH)
        .send(mockBody)
        .expect(HttpStatus.BAD_REQUEST);

      expect(body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'published',
          },
        ],
      });
    });
  });
});
