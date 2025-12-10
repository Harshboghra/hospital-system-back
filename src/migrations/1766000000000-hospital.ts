import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfiles1766000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        DROP COLUMN IF EXISTS "categoryId";
    `);

    await queryRunner.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_group_enum') THEN
            CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
          END IF;
        END $$;
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "doctor_profile" (
          "user_id" integer PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
          "categoryId" integer REFERENCES "category"(id),
          "registration_no" varchar(50),
          "years_experience" integer,
          "clinic_name" varchar(150),
          "bio" text
        );
    `);

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "patient_profile" (
          "user_id" integer PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
          "blood_group" blood_group_enum,
          "date_of_birth" date,
          "gender" varchar(20),
          "height_cm" numeric(5,2),
          "weight_kg" numeric(5,2),
          "allergies" text,
          "chronic_diseases" text,
          "emergency_contact_name" varchar(100),
          "emergency_contact_phone" varchar(20)
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "patient_profile";
    `);

    await queryRunner.query(`
        DROP TABLE IF EXISTS "doctor_profile";
    `);

    await queryRunner.query(`
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_group_enum') THEN
            DROP TYPE blood_group_enum;
          END IF;
        END $$;
    `);

    await queryRunner.query(`
        ALTER TABLE "user"
        ADD COLUMN "categoryId" integer REFERENCES "category"(id);
    `);
  }
}

