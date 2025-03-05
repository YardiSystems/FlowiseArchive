-- Drop foreign key constraints for our tables
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_lead_chatflowid]') AND parent_object_id = OBJECT_ID(N'[dbo].[lead]'))
    ALTER TABLE [dbo].[lead] DROP CONSTRAINT [FK_lead_chatflowid]
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_chat_message_chatflowid]') AND parent_object_id = OBJECT_ID(N'[dbo].[chat_message]'))
    ALTER TABLE [dbo].[chat_message] DROP CONSTRAINT [FK_chat_message_chatflowid]
GO

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_assistant_credential]') AND parent_object_id = OBJECT_ID(N'[dbo].[assistant]'))
    ALTER TABLE [dbo].[assistant] DROP CONSTRAINT [FK_assistant_credential]
GO

-- Clear data from our tables
DELETE FROM [dbo].[lead]
DELETE FROM [dbo].[apikey]
DELETE FROM [dbo].[document_store]
DELETE FROM [dbo].[assistant]
DELETE FROM [dbo].[variable]
DELETE FROM [dbo].[tool]
DELETE FROM [dbo].[credential]
DELETE FROM [dbo].[chat_message]
DELETE FROM [dbo].[chat_flow]
GO

-- Drop our tables if they exist
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[lead]') AND type in (N'U'))
    DROP TABLE [dbo].[lead]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[apikey]') AND type in (N'U'))
    DROP TABLE [dbo].[apikey]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[document_store]') AND type in (N'U'))
    DROP TABLE [dbo].[document_store]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assistant]') AND type in (N'U'))
    DROP TABLE [dbo].[assistant]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[variable]') AND type in (N'U'))
    DROP TABLE [dbo].[variable]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tool]') AND type in (N'U'))
    DROP TABLE [dbo].[tool]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[credential]') AND type in (N'U'))
    DROP TABLE [dbo].[credential]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_message]') AND type in (N'U'))
    DROP TABLE [dbo].[chat_message]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_flow]') AND type in (N'U'))
    DROP TABLE [dbo].[chat_flow]
GO

-- Create chat_flow table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_flow]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_flow] (
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
        CONSTRAINT [PK_chat_flow] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create chat_message table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[chat_message]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[chat_message] (
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
        CONSTRAINT [PK_chat_message] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [FK_chat_message_chatflowid] FOREIGN KEY ([chatflowid]) 
            REFERENCES [dbo].[chat_flow] ([id]) ON DELETE CASCADE
    )
END
GO

-- Create index on chat_message
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IDX_chat_message_chatflowid' AND object_id = OBJECT_ID('[dbo].[chat_message]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IDX_chat_message_chatflowid] ON [dbo].[chat_message] ([chatflowid])
END
GO

-- Create credential table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[credential]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[credential] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [name] nvarchar(255) NOT NULL,
        [credentialName] nvarchar(255) NOT NULL,
        [encryptedData] nvarchar(max) NOT NULL,
        [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
        [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_credential] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create tool table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tool]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tool] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [name] nvarchar(255) NOT NULL,
        [description] nvarchar(max) NOT NULL,
        [color] nvarchar(255) NOT NULL,
        [iconSrc] nvarchar(255) NULL,
        [schema] nvarchar(max) NULL,
        [func] nvarchar(max) NULL,
        [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
        [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_tool] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create variable table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[variable]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[variable] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [name] nvarchar(255) NOT NULL,
        [value] nvarchar(max) NOT NULL,
        [type] nvarchar(255) NULL,
        [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
        [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_variable] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create assistant table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assistant]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[assistant] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [credential] uniqueidentifier NOT NULL,
        [details] nvarchar(max) NOT NULL,
        [iconSrc] nvarchar(255) NULL,
        [type] nvarchar(255) NULL,
        [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
        [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_assistant] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [FK_assistant_credential] FOREIGN KEY ([credential]) 
            REFERENCES [dbo].[credential] ([id]) ON DELETE CASCADE
    )
END
GO

-- Create document_store table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[document_store]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[document_store] (
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
        CONSTRAINT [PK_document_store] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create apikey table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[apikey]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[apikey] (
        [id] nvarchar(20) NOT NULL,
        [apiKey] nvarchar(max) NOT NULL,
        [apiSecret] nvarchar(max) NOT NULL,
        [keyName] nvarchar(max) NOT NULL,
        [updatedDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_apikey] PRIMARY KEY CLUSTERED ([id])
    )
END
GO

-- Create lead table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[lead]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[lead] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [chatflowid] uniqueidentifier NOT NULL,
        [chatId] nvarchar(255) NOT NULL,
        [name] nvarchar(255) NULL,
        [email] nvarchar(255) NULL,
        [phone] nvarchar(255) NULL,
        [createdDate] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_lead] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [FK_lead_chatflowid] FOREIGN KEY ([chatflowid]) 
            REFERENCES [dbo].[chat_flow] ([id]) ON DELETE CASCADE
    )
END
GO

-- Select statements to verify data
SELECT * FROM [dbo].[chat_flow]
GO
SELECT * FROM [dbo].[chat_message]
GO
SELECT * FROM [dbo].[credential]
GO
SELECT * FROM [dbo].[tool]
GO
SELECT * FROM [dbo].[variable]
GO
SELECT * FROM [dbo].[assistant]
GO
SELECT * FROM [dbo].[document_store]
GO
SELECT * FROM [dbo].[apikey]
GO
SELECT * FROM [dbo].[lead]
GO