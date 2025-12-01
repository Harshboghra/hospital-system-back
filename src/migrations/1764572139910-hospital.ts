import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764572139910 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Create usertype Table
        CREATE TABLE "userType" (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL UNIQUE  -- doctor, admin, customer
        );

        -- Default values
        INSERT INTO "userType" (type)
        VALUES ('doctor'), ('admin'), ('patient');

        -- Create user Table
        CREATE TABLE "user" (
            "id" SERIAL PRIMARY KEY,
            "name" VARCHAR(100) NOT NULL,
            "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
            "email" VARCHAR(120) NOT NULL UNIQUE,
            "userTypeId" INT NOT NULL REFERENCES "userType",
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create appointment Table
        CREATE TABLE "appointment" (
            "id" SERIAL PRIMARY KEY,
            "type" VARCHAR(50) NOT NULL,
            "state" VARCHAR(20) NOT NULL CHECK (state IN ('upcoming', 'ongoing', 'completed')),
            "time" TIMESTAMP NOT NULL,

            "doctorId" INT NOT NULL REFERENCES "user",
            "patientId" INT NOT NULL REFERENCES "user",

            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );  
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "appointment";
        DROP TABLE IF EXISTS "user";
        DROP TABLE IF EXISTS "userType";
    `);
  }
}
