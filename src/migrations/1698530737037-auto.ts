import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1698530737037 implements MigrationInterface {
  name = 'Auto1698530737037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" DROP COLUMN "telegramId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" ADD "telegramId" bigint`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" DROP COLUMN "telegramId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" ADD "telegramId" integer`,
    );
  }
}
