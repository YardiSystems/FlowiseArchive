import { DataSource } from 'typeorm'
import { getDataSourceForSubdomain } from '../DataSource'
import { Request } from 'express'

// This function replaces the direct dataSource export
// Callers will need to be updated to use this async function
export async function getTypeORMDataSource(subdomain: string = 'default', req?: Request): Promise<DataSource> {
    return getDataSourceForSubdomain(subdomain, req)
}

export async function getDataSource(subdomain: string, req?: Request) {
    return getDataSourceForSubdomain(subdomain, req)
}
