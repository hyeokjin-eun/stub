import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCollectionComments1709000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // collection_comments 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'collection_comments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'collection_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'collection_comments',
      new TableForeignKey({
        columnNames: ['collection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'collections',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'collection_comments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('collection_comments');
  }
}
