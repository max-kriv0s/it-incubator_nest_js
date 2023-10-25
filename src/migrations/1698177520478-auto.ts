import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1698177520478 implements MigrationInterface {
  name = 'Auto1698177520478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "TelegramUserAccounts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "telegramId" integer NOT NULL, "activateCode" character varying NOT NULL, "expirationTime" TIMESTAMP NOT NULL, CONSTRAINT "PK_66641b0e92977c176efde862381" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "telegramAccountId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" ADD CONSTRAINT "UQ_b4afec20b8c4f9ce0020e40be5c" UNIQUE ("telegramAccountId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" DROP CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" ALTER COLUMN "blogId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" ADD CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35" FOREIGN KEY ("blogId") REFERENCES "Blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" ADD CONSTRAINT "FK_b4afec20b8c4f9ce0020e40be5c" FOREIGN KEY ("telegramAccountId") REFERENCES "TelegramUserAccounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Users" DROP CONSTRAINT "FK_b4afec20b8c4f9ce0020e40be5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" DROP CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35"`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" ALTER COLUMN "blogId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" ADD CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35" FOREIGN KEY ("blogId") REFERENCES "Blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" DROP CONSTRAINT "UQ_b4afec20b8c4f9ce0020e40be5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Users" DROP COLUMN "telegramAccountId"`,
    );
    await queryRunner.query(`DROP TABLE "TelegramUserAccounts"`);
  }
}
