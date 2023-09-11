import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1694238499524 implements MigrationInterface {
  name = 'Auto1694238499524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "PairQuizGame" ("id" SERIAL NOT NULL, "firstPlayerId" integer NOT NULL, "secondPlayerId" integer NOT NULL, "status" "public"."PairQuizGame_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer', "pairCreateDate" TIMESTAMP NOT NULL DEFAULT now(), "startGame" TIMESTAMP, "finishGame" TIMESTAMP, CONSTRAINT "PK_18c1804927c47de8b390e400ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PairQuizGameProgress" ("id" SERIAL NOT NULL, "gameId" integer NOT NULL, "userId" integer NOT NULL, "questionId" integer NOT NULL, "questionNumber" integer NOT NULL, "addedAt" TIMESTAMP NOT NULL, "answerStatus" "public"."PairQuizGameProgress_answerstatus_enum", "score" integer NOT NULL, "bonus_score" integer NOT NULL, CONSTRAINT "PK_44b553ab87b7f761e78e66986eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_356a7f91e6dfc23bf87f0fb39b" ON "PairQuizGameProgress" ("gameId", "userId", "questionId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD CONSTRAINT "FK_af8a3a7fa319272cb77876cb54d" FOREIGN KEY ("firstPlayerId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" ADD CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f" FOREIGN KEY ("secondPlayerId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ADD CONSTRAINT "FK_adba5afa8daf809726b678f55dc" FOREIGN KEY ("gameId") REFERENCES "PairQuizGame"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ADD CONSTRAINT "FK_f8f6d5abc509f686f6fc721273b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" ADD CONSTRAINT "FK_04ff4894f73e8c9f8756283550c" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" DROP CONSTRAINT "FK_04ff4894f73e8c9f8756283550c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" DROP CONSTRAINT "FK_f8f6d5abc509f686f6fc721273b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGameProgress" DROP CONSTRAINT "FK_adba5afa8daf809726b678f55dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP CONSTRAINT "FK_324ca2c7288e0c3526d090bbe5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PairQuizGame" DROP CONSTRAINT "FK_af8a3a7fa319272cb77876cb54d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_356a7f91e6dfc23bf87f0fb39b"`,
    );
    await queryRunner.query(`DROP TABLE "PairQuizGameProgress"`);
    await queryRunner.query(`DROP TABLE "PairQuizGame"`);
  }
}
