import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1765433738347 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Default values Admin user
        INSERT INTO "user" (name, "email", "userTypeId", password, "phoneNumber")
        VALUES ('Admin', 'admin@gmail.com', 1, '$2b$10$oPreyeahfFrcrO8WSnIB0u27SwIVXdwLw.hvwYcsXtNMlbuTOB5Va', 2365417899);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
