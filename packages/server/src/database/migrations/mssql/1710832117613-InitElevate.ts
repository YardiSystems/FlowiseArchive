import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitElevate1710832117613 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints for our tables
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_elevate_lead_chatflowid]') AND parent_object_id = OBJECT_ID(N'[dbo].[elevate_lead]'))
                ALTER TABLE [dbo].[elevate_lead] DROP CONSTRAINT [FK_elevate_lead_chatflowid]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_elevate_chat_message_chatflowid]') AND parent_object_id = OBJECT_ID(N'[dbo].[elevate_chat_message]'))
                ALTER TABLE [dbo].[elevate_chat_message] DROP CONSTRAINT [FK_elevate_chat_message_chatflowid]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_elevate_assistant_credential]') AND parent_object_id = OBJECT_ID(N'[dbo].[elevate_assistant]'))
                ALTER TABLE [dbo].[elevate_assistant] DROP CONSTRAINT [FK_elevate_assistant_credential]`
        )

        // Clear data from our tables
        await queryRunner.query(`DELETE FROM [dbo].[elevate_lead]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_apikey]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_document_store]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_assistant]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_variable]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_tool]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_credential]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_chat_message]`)
        await queryRunner.query(`DELETE FROM [dbo].[elevate_chat_flow]`)

        // Drop our tables if they exist
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_lead]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_lead]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_apikey]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_apikey]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_document_store]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_document_store]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_assistant]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_assistant]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_variable]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_variable]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_tool]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_tool]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_credential]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_credential]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_chat_message]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_chat_message]`
        )
        await queryRunner.query(
            `IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[elevate_chat_flow]') AND type in (N'U'))
                DROP TABLE [dbo].[elevate_chat_flow]`
        )

        // Create chat_flow table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_chat_flow] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [flowData] nvarchar(max) NOT NULL,
                [deployed] bit NULL,
                [isPublic] bit NULL,
                [apikeyid] nvarchar(20) NULL,
                [chatbotConfig] nvarchar(max) NULL,
                [apiConfig] nvarchar(max) NULL,
                [analytic] nvarchar(max) NULL,
                [speechToText] nvarchar(max) NULL,
                [followUpPrompts] nvarchar(max) NULL,
                [category] nvarchar(max) NULL,
                [type] nvarchar(255) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_chat_flow] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create chat_message table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_chat_message] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [role] nvarchar(255) NOT NULL,
                [chatflowid] uniqueidentifier NOT NULL,
                [content] nvarchar(max) NOT NULL,
                [sourceDocuments] nvarchar(max) NULL,
                [usedTools] nvarchar(max) NULL,
                [fileAnnotations] nvarchar(max) NULL,
                [agentReasoning] nvarchar(max) NULL,
                [fileUploads] nvarchar(max) NULL,
                [artifacts] nvarchar(max) NULL,
                [action] nvarchar(max) NULL,
                [chatType] nvarchar(255) NOT NULL,
                [chatId] nvarchar(255) NOT NULL,
                [memoryType] nvarchar(255) NULL,
                [sessionId] nvarchar(255) NULL,
                [leadEmail] nvarchar(max) NULL,
                [followUpPrompts] nvarchar(max) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_chat_message] PRIMARY KEY CLUSTERED ([id]),
                CONSTRAINT [FK_elevate_chat_message_chatflowid] FOREIGN KEY ([chatflowid]) 
                    REFERENCES [dbo].[elevate_chat_flow] ([id]) ON DELETE CASCADE
            )`
        )

        // Create index on chat_message
        await queryRunner.query(
            `CREATE NONCLUSTERED INDEX [IDX_elevate_chat_message_chatflowid] ON [dbo].[elevate_chat_message] ([chatflowid])`
        )

        // Create credential table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_credential] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [credentialName] nvarchar(255) NOT NULL,
                [encryptedData] nvarchar(max) NOT NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_credential] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create tool table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_tool] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [description] nvarchar(max) NOT NULL,
                [color] nvarchar(255) NOT NULL,
                [iconSrc] nvarchar(255) NULL,
                [schema] nvarchar(max) NULL,
                [func] nvarchar(max) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_tool] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create variable table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_variable] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [value] nvarchar(max) NOT NULL,
                [type] nvarchar(255) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_variable] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create assistant table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_assistant] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [credential] uniqueidentifier NOT NULL,
                [details] nvarchar(max) NOT NULL,
                [iconSrc] nvarchar(255) NULL,
                [type] nvarchar(255) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_assistant] PRIMARY KEY CLUSTERED ([id]),
                CONSTRAINT [FK_elevate_assistant_credential] FOREIGN KEY ([credential]) 
                    REFERENCES [dbo].[elevate_credential] ([id]) ON DELETE CASCADE
            )`
        )

        // Create document_store table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_document_store] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [name] nvarchar(255) NOT NULL,
                [description] nvarchar(max) NULL,
                [loaders] nvarchar(max) NULL,
                [whereUsed] nvarchar(max) NULL,
                [vectorStoreConfig] nvarchar(max) NULL,
                [embeddingConfig] nvarchar(max) NULL,
                [recordManagerConfig] nvarchar(max) NULL,
                [status] nvarchar(255) NOT NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_document_store] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create apikey table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_apikey] (
                [id] nvarchar(20) NOT NULL,
                [apiKey] nvarchar(max) NOT NULL,
                [apiSecret] nvarchar(max) NOT NULL,
                [keyName] nvarchar(max) NOT NULL,
                [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_apikey] PRIMARY KEY CLUSTERED ([id])
            )`
        )

        // Create lead table
        await queryRunner.query(
            `CREATE TABLE [dbo].[elevate_lead] (
                [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
                [chatflowid] uniqueidentifier NOT NULL,
                [chatId] nvarchar(255) NOT NULL,
                [name] nvarchar(255) NULL,
                [email] nvarchar(255) NULL,
                [phone] nvarchar(255) NULL,
                [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT [PK_elevate_lead] PRIMARY KEY CLUSTERED ([id]),
                CONSTRAINT [FK_elevate_lead_chatflowid] FOREIGN KEY ([chatflowid]) 
                    REFERENCES [dbo].[elevate_chat_flow] ([id]) ON DELETE CASCADE
            )`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order of creation
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_lead]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_apikey]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_document_store]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_assistant]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_variable]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_tool]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_credential]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_chat_message]`)
        await queryRunner.query(`DROP TABLE IF EXISTS [dbo].[elevate_chat_flow]`)
    }
} 