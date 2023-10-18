import { MigrationInterface, QueryRunner } from 'typeorm';

export class Auto1697561875002 implements MigrationInterface {
  name = 'Auto1697561875002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "BlogPhotos" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "fileSize" integer NOT NULL, "storageId" character varying NOT NULL, "fileType" "public"."BlogPhotos_filetype_enum" NOT NULL, "blogId" integer, CONSTRAINT "PK_ab2758997fa562ca4d0f982a142" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PostPhotos" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "fileSize" integer NOT NULL, "storageId" character varying NOT NULL, "sizePhoto" "public"."PostPhotos_sizephoto_enum" NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_522cf0dd2c4c4ce16b8f9e25c82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" ADD CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35" FOREIGN KEY ("blogId") REFERENCES "Blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "PostPhotos" ADD CONSTRAINT "FK_ea1f5a06e5a7ce600805553cc7b" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PostPhotos" DROP CONSTRAINT "FK_ea1f5a06e5a7ce600805553cc7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "BlogPhotos" DROP CONSTRAINT "FK_4b9137d0cb4dd86a9c4b1af3f35"`,
    );
    await queryRunner.query(`DROP TABLE "PostPhotos"`);
    await queryRunner.query(`DROP TABLE "BlogPhotos"`);
  }
}
