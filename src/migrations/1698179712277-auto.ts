import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1698179712277 implements MigrationInterface {
  name = 'Auto1698179712277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" ALTER COLUMN "telegramId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "TelegramUserAccounts" ALTER COLUMN "telegramId" SET NOT NULL`,
    );
  }
}
