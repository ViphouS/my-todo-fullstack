import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792253906466 implements MigrationInterface {
    name = 'Init1792253906466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(200) NOT NULL, "role" character varying(100) NOT NULL DEFAULT '', CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "todo" ("id" SERIAL NOT NULL, "title" character varying(200) NOT NULL, "status" character varying NOT NULL DEFAULT 'TODO', "starred" boolean NOT NULL DEFAULT false, "position" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todo"`);
        await queryRunner.query(`DROP TABLE "profile"`);
    }

}
