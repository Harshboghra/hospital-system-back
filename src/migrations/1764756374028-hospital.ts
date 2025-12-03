import { MigrationInterface, QueryRunner } from 'typeorm';

export class Hospital1764756374028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "appointment"
        DROP CONSTRAINT IF EXISTS appointment_state_check;
    `);

    await queryRunner.query(`
        ALTER TABLE "appointment"
        ADD CONSTRAINT appointment_state_check
        CHECK (state IN ('upcoming', 'completed', 'canceled'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "appointment"
        DROP CONSTRAINT IF EXISTS appointment_state_check;
    `);

    await queryRunner.query(`
        ALTER TABLE "appointment"
        ADD CONSTRAINT appointment_state_check
        CHECK (state IN ('upcoming', 'ongoing', 'completed'));
    `);
  }
}
