import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchIndexes1790682000000 implements MigrationInterface {
  name = 'AddSearchIndexes1790682000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_employees_country" ON "employees" ("country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_employees_department" ON "employees" ("department")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_salaries_employee_effective_from" ON "salaries" ("employee_id", "effective_from")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_salaries_employee_effective_from"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_employees_department"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_employees_country"`);
  }
}
