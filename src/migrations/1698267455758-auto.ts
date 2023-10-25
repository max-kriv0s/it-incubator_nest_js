import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1698267455758 implements MigrationInterface {
    name = 'Auto1698267455758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."BlogSubscribers_status_enum" AS ENUM('Subscribed', 'Unsubscribed', 'None')`);
        await queryRunner.query(`CREATE TABLE "BlogSubscribers" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "blogId" integer NOT NULL, "subscriberId" integer NOT NULL, "status" "public"."BlogSubscribers_status_enum" NOT NULL DEFAULT 'None', CONSTRAINT "PK_b470da9e6d7393fb3efcc55115a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "BlogSubscribers" ADD CONSTRAINT "FK_96c57c0b19b617b8fa1e4fd4533" FOREIGN KEY ("blogId") REFERENCES "Blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BlogSubscribers" ADD CONSTRAINT "FK_7b6083757bebf4cfb1920dab0cb" FOREIGN KEY ("subscriberId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BlogSubscribers" DROP CONSTRAINT "FK_7b6083757bebf4cfb1920dab0cb"`);
        await queryRunner.query(`ALTER TABLE "BlogSubscribers" DROP CONSTRAINT "FK_96c57c0b19b617b8fa1e4fd4533"`);
        await queryRunner.query(`DROP TABLE "BlogSubscribers"`);
        await queryRunner.query(`DROP TYPE "public"."BlogSubscribers_status_enum"`);
    }

}
