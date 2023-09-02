import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1693607734313 implements MigrationInterface {
    name = 'Auto1693607734313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Question" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "correctAnswers" json NOT NULL, "published" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1a855c8b4f527c9633c4b054675" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Question"`);
    }

}
