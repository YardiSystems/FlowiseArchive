import 'reflect-metadata'
import path from 'path'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { getUserHome } from './utils'
import { entities } from './database/entities'
import { sqliteMigrations } from './database/migrations/sqlite'
import { mysqlMigrations } from './database/migrations/mysql'
import { mariadbMigrations } from './database/migrations/mariadb'
import { postgresMigrations } from './database/migrations/postgres'

let appDataSource: DataSource
let elevateDataSource: DataSource

export const init = async (): Promise<void> => {
    let homePath
    let flowisePath = path.join(getUserHome(), '.flowise')
    if (!fs.existsSync(flowisePath)) {
        fs.mkdirSync(flowisePath)
    }

    // Initialize main database connection (Flowise database)
    switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
        case 'mysql':
            appDataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mysqlMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'mariadb':
            appDataSource = new DataSource({
                type: 'mariadb',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mariadbMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'postgres':
            appDataSource = new DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: getDatabaseSSLFromEnv(),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: postgresMigrations
            })
            break
        case 'mssql':
            appDataSource = new DataSource({
                type: 'mssql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '1433'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                options: {
                    encrypt: process.env.DATABASE_SSL === 'true',
                    trustServerCertificate: process.env.DATABASE_SSL === 'true'
                }
            })
            break
        default:
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
    }

    // Initialize elevate database connection (Company database)
    elevateDataSource = new DataSource({
        type: 'mssql',
        host: process.env.ELEVATE_DATABASE_HOST,
        port: parseInt(process.env.ELEVATE_DATABASE_PORT || '1433'),
        username: process.env.ELEVATE_DATABASE_USER,
        password: process.env.ELEVATE_DATABASE_PASSWORD,
        database: process.env.ELEVATE_DATABASE_NAME,
        synchronize: false,
        migrationsRun: false,
        // No entities or migrations needed for the elevate database
        entities: [],
        migrations: [],
        options: {
            encrypt: process.env.ELEVATE_DATABASE_SSL === 'true',
            trustServerCertificate: process.env.ELEVATE_DATABASE_SSL === 'true'
        }
    })
}

// Synchronous getter for the main database (Flowise database)
export function getDataSource(): DataSource {
    if (!appDataSource) {
        throw new Error('Database not initialized. Call init() first.')
    }
    return appDataSource
}

// Synchronous getter for the elevate database (Company database)
export function getElevateDataSource(): DataSource {
    if (!elevateDataSource) {
        throw new Error('Database not initialized. Call init() first.')
    }
    return elevateDataSource
}

const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        }
    } else if (process.env.DATABASE_SSL === 'true') {
        return true
    }
    return undefined
}
