import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Request } from 'express'
import { entities } from './database/entities'

interface DatabaseConfig {
    host: string
    database: string
    username: string
    password: string
    port?: number
}

// Extend Express Request to include queryStore
declare global {
    namespace Express {
        interface Request {
            queryStore?: {
                [key: string]: string | string[] | any | undefined
            }
        }
    }
}

let elevateDataSource: DataSource
const dataSources: Map<string, DataSource> = new Map()

export const init = async (): Promise<void> => {
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
        entities: [],
        migrations: [],
        options: {
            encrypt: process.env.ELEVATE_DATABASE_SSL === 'true',
            trustServerCertificate: process.env.ELEVATE_DATABASE_SSL === 'true'
        }
    })

    await elevateDataSource.initialize()
}

// Get database configuration for a subdomain from elevate database
async function getDatabaseConfig(subdomain: string, req?: Request): Promise<DatabaseConfig> {
    // Check if all required query parameters are present
    const companyId = req?.queryStore?.CompanyId
    const databaseId = req?.queryStore?.DatabaseId
    const databaseCredId = req?.queryStore?.DatabaseCredId

    let query: string
    let params: any[]

    if (companyId && databaseId && databaseCredId) {
        query = `select top 1 db.instance, db.[database], CONVERT(VARCHAR(MAX), [user]) [user], CONVERT(VARCHAR(MAX), pass) pass
                from voyagerdb db
                join voyagerdbcred cred on cred.voyagerdbid = db.id
                join company c on c.id = db.companyid
                where c.id = @0
                and db.id = @1
                and cred.id = @2`
        params = [companyId, databaseId, databaseCredId]
    } else {
        query = `select top 1 db.instance, db.[database], CONVERT(VARCHAR(MAX), [user]) [user], CONVERT(VARCHAR(MAX), pass) pass
                from voyagerdb db
                join voyagerdbcred cred on cred.voyagerdbid = db.id
                join company c on c.id = db.companyid
                where c.domain = @0`
        params = [subdomain]
    }

    const result = await elevateDataSource.query(query, params)

    if (!result || result.length === 0) {
        throw new Error(`No database configuration found for ${companyId ? 'company ID: ' + companyId : 'subdomain: ' + subdomain}`)
    }

    return {
        host: result[0].instance,
        database: result[0].database,
        username: result[0].user,
        password: result[0].pass,
        port: parseInt(process.env.DATABASE_PORT || '1433')
    }
}

// Get connection key for caching
function getConnectionKey(config: DatabaseConfig): string {
    return `${config.host}_${config.username}_${config.database}`
}

// Get or create a data source for the given subdomain
export async function getDataSourceForSubdomain(subdomain: string, req?: Request): Promise<DataSource> {
    // Get database configuration from elevate database
    const config = await getDatabaseConfig(subdomain, req)
    const connectionKey = getConnectionKey(config)

    // Check if we already have an initialized connection
    let dataSource = dataSources.get(connectionKey)
    if (dataSource && dataSource.isInitialized) {
        return dataSource
    }

    // Create new connection if it doesn't exist
    dataSource = new DataSource({
        type: 'mssql',
        host: config.host,
        port: config.port || 1433,
        username: config.username,
        password: config.password,
        database: config.database,
        synchronize: false,
        migrationsRun: false,
        entities: Object.values(entities),
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    })

    // Initialize the connection
    await dataSource.initialize()

    // Store the connection
    dataSources.set(connectionKey, dataSource)

    return dataSource
}

// Get elevate data source
export function getElevateDataSource(): DataSource {
    if (!elevateDataSource) {
        throw new Error('Database not initialized. Call init() first.')
    }
    return elevateDataSource
}

// Close all connections
export async function closeAllConnections(): Promise<void> {
    for (const [key, dataSource] of dataSources.entries()) {
        if (dataSource.isInitialized) {
            await dataSource.destroy()
        }
        dataSources.delete(key)
    }

    if (elevateDataSource && elevateDataSource.isInitialized) {
        await elevateDataSource.destroy()
    }
}
