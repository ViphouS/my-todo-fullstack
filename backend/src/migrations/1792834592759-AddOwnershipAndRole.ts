import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnershipAndRole1792834592759 implements MigrationInterface {
    name = 'AddOwnershipAndRole1792834592759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "profile" ADD "ownerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "UQ_552aa6698bb78970f6569161ec0" UNIQUE ("ownerId")`);
        await queryRunner.query(`ALTER TABLE "todo" ADD "ownerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_552aa6698bb78970f6569161ec0" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "todo" ADD CONSTRAINT "FK_05552e862619dc4ad7ec8fc9cb8" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo" DROP CONSTRAINT "FK_05552e862619dc4ad7ec8fc9cb8"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_552aa6698bb78970f6569161ec0"`);
        await queryRunner.query(`ALTER TABLE "todo" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "UQ_552aa6698bb78970f6569161ec0"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
