import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1694360084312 implements MigrationInterface {
  name = 'Auto1694360084312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "addedAt" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "score" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "bonus_score" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ALTER COLUMN "secondPlayerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f" FOREIGN KEY ("secondPlayerId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ALTER COLUMN "secondPlayerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f" FOREIGN KEY ("secondPlayerId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "bonus_score" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "score" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ALTER COLUMN "addedAt" SET NOT NULL`,
    );
  }
}
