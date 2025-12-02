import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764650456657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        ADD COLUMN "password" VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        DROP COLUMN "password";
    `);
  }
}
