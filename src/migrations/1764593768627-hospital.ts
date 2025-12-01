import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764593768627 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "appointment"
        ADD COLUMN "categoryId" integer REFERENCES category;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "appointment"
        DROP COLUMN "categoryId";
    `);
  }
}
