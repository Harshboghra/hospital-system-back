import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764572139910 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Create usertype Table
        CREATE TABLE "usertype" (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL UNIQUE  -- doctor, admin, customer
        );

        -- Default values
        INSERT INTO "usertype" (type)
        VALUES ('doctor'), ('admin'), ('customer');

        -- Create user Table
        CREATE TABLE "user" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone_number VARCHAR(20) NOT NULL UNIQUE,
            email VARCHAR(120) NOT NULL UNIQUE,
            usertype_id INT NOT NULL REFERENCES "usertype"(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create appointment Table
        CREATE TABLE "appointment" (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            state VARCHAR(20) NOT NULL CHECK (state IN ('upcoming', 'ongoing', 'completed')),
            appointment_date DATE NOT NULL,

            doctor_id INT NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
            person_id INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "appointment";
        DROP TABLE IF EXISTS "user";
        DROP TABLE IF EXISTS "usertype";
    `);
  }
}
