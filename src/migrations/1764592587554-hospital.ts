import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764592587554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "category" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
    `);

    await queryRunner.query(`
        INSERT INTO "category" (name) VALUES
        ('Cardiologist'),
        ('Neurologist'),
        ('Oncologist'),
        ('Gastroenterologist'),
        ('Ophthalmologist'),
        ('Dermatologist'),
        ('Obstetrics and gynaecology'),
        ('Endocrinologist'),
        ('Psychiatrist');
    `);

    await queryRunner.query(`
        ALTER TABLE public."user"
        ADD COLUMN "categoryId" INTEGER REFERENCES "category";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE public."user"
        DROP COLUMN "categoryId";
    `);
    
    await queryRunner.query(`
        DROP TABLE IF EXISTS "category";
    `);
  }
}
