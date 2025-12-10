import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1765600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "profile_image_url" text,
      ADD COLUMN "profile_image_public_id" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN "profile_image_public_id",
      DROP COLUMN "profile_image_url"
    `);
  }
}
