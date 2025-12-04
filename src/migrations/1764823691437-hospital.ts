import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764823691437 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "medicine" (
            "id" SERIAL PRIMARY KEY,
            "appointmentId" INT NOT NULL REFERENCES "appointment",

            "name" VARCHAR(100) NOT NULL,
            "quantity" INT NOT NULL,
            "dosage" VARCHAR(50),        -- optional
            "instructions" TEXT,         -- optional

            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "medicine";
    `);
  }
}
