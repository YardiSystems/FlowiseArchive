import { DataSource } from 'typeorm'
import { entities } from './database/entities'
import { sqliteMigrations } from './database/migrations/sqlite'
import { mysqlMigrations } from './database/migrations/mysql'
import { mariadbMigrations } from './database/migrations/mariadb'
import { postgresMigrations } from './database/migrations/postgres'
import { getElevateDataSource } from './DataSource'
import logger from './utils/logger'

interface DatabaseConfig {
    instance: string
    database: string
    user: string
    pass: string
    id: string
}

export class DynamicDataSource {
    private static instance: DynamicDataSource
    private connections: Map<string, DataSource> = new Map()

    private constructor() {}

    public static getInstance(): DynamicDataSource {
        if (!DynamicDataSource.instance) {
            DynamicDataSource.instance = new DynamicDataSource()
        }
        return DynamicDataSource.instance
    }

    public async getDataSource(subdomain: string): Promise<DataSource> {
        // Check if we already have a connection for this subdomain
        if (this.connections.has(subdomain)) {
            const dataSource = this.connections.get(subdomain)!
            if (dataSource.isInitialized) {
                return dataSource
            }
            await dataSource.initialize()
            return dataSource
        }

        // Get database configuration from elevate database
        const elevateDataSource = getElevateDataSource()
        const result = await elevateDataSource.query(
            `select top 1 db.instance, db.[database] , CONVERT(VARCHAR(MAX), [user]) [user], CONVERT(VARCHAR(MAX), pass) pass
             from voyagerdb db
             join voyagerdbcred cred on cred.voyagerdbid = db.id
             join company c on c.id = db.companyid
             where c.domain = @0`,
            [subdomain]
        )

        if (!result || result.length === 0) {
            throw new Error(`No database configuration found for subdomain: ${subdomain}`)
        }

        const config: DatabaseConfig = result[0]

        // Create new data source
        const dataSource = new DataSource({
            type: 'mssql',
            host: config.instance,
            port: 1433,
            username: config.user,
            password: config.pass,
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
        this.connections.set(subdomain, dataSource)

        return dataSource
    }

    public async closeConnection(subdomain: string): Promise<void> {
        const dataSource = this.connections.get(subdomain)
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy()
            this.connections.delete(subdomain)
        }
    }

    public async closeAllConnections(): Promise<void> {
        const closePromises = Array.from(this.connections.keys()).map(subdomain => 
            this.closeConnection(subdomain)
        )
        await Promise.all(closePromises)
    }
} 