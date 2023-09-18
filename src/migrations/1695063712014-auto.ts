import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1695063712014 implements MigrationInterface {
    name = 'Auto1695063712014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PairQuizGame" RENAME COLUMN "pairCreateDate" TO "pairCreatedDate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PairQuizGame" RENAME COLUMN "pairCreatedDate" TO "pairCreateDate"`);
    }

}
