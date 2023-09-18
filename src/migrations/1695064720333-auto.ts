import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1695064720333 implements MigrationInterface {
  name = 'Auto1695064720333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP COLUMN "startGame"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP COLUMN "finishGame"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD "startGameDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD "finishGameDate" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP COLUMN "finishGameDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP COLUMN "startGameDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD "finishGame" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD "startGame" TIMESTAMP`,
    );
  }
}
