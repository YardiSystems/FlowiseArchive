import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCompanyTable1710832117614 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the company table if it exists
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[company]') AND type in (N'U'))
                DROP TABLE [dbo].[company]`
        )

        // Create company table
        await queryRunner.query(
            `CREATE TABLE [dbo].[company] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [domain] nvarchar(255) NOT NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_company] PRIMARY KEY CLUSTERED ([id]),
                CONSTRAINT [UQ_company_domain] UNIQUE NONCLUSTERED ([domain])
            )`
        )

        // Insert some sample data
        await queryRunner.query(
            `INSERT INTO [dbo].[company] ([name], [domain]) VALUES 
            ('Sample Company 1', 'sample1'),
            ('Sample Company 2', 'sample2')`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[company]`)
    }
} 