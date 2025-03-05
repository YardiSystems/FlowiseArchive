import { DataSource } from 'typeorm'
import { getDataSourceForSubdomain } from '../DataSource'

// This function replaces the direct dataSource export
// Callers will need to be updated to use this async function
export async function getTypeORMDataSource(subdomain: string = 'default'): Promise<DataSource> {
    return getDataSourceForSubdomain(subdomain)
}
