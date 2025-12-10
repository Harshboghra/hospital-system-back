import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1765365814863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        DROP CONSTRAINT IF EXISTS "user_userTypeId_fkey";
    `);

    await queryRunner.query(`
        DROP TABLE IF EXISTS "userType";    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Create usertype Table
        CREATE TABLE "userType" (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL UNIQUE  -- doctor, admin, customer
        );

        -- Default values
        INSERT INTO "userType" (type)
        VALUES ('doctor'), ('admin'), ('patient');
    `);
  }
}
