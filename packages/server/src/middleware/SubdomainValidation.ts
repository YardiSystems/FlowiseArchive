import { Request, Response, NextFunction } from 'express'
import { getElevateDataSource } from '../DataSource'
import { DynamicDataSource } from '../DynamicDataSource'
import logger from '../utils/logger'

export const validateSubdomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Skip validation for non-API routes
        if (!req.path.startsWith('/api/')) {
            return next()
        }

        // Get the host from the request
        const host = req.get('host') || ''
        
        // Extract subdomain
        // Format: subdomain.elevatate.cafe:3000
        const subdomain = host.split('.')[0]
        
        // Skip validation if no subdomain or if it's localhost
        if (!subdomain || subdomain === 'localhost' || subdomain === '127.0.0.1') {
            return next()
        }

        // Get elevate database connection
        const elevateDataSource = getElevateDataSource()
        
        // Query the company table in elevate database
        const result = await elevateDataSource.query(
            `SELECT id, name, domain, inactive, status, issingledomain, isinternal, allowcustommenus, issql, 
                    authenticationmode, yardioneurl, yardipin, address, city, state, zipcode, phone, 
                    companylogo, createddate, Address2, Country, Notes, IsOmniEnabled, guid, updateddate, 
                    refreshtokenenabled, isfeemanagerclient, refreshtokenexpirystellarcasenumber, 
                    refreshtokenexpirydurationindays, displayreadonlycheckbox, IsReleaseException, 
                    virtuosoenabled, locationid
             FROM company 
             WHERE domain = @0`,
            [subdomain]
        )

        if (!result || result.length === 0) {
            logger.warn(`Invalid subdomain access attempt: ${subdomain}`)
            return res.status(403).json({
                error: 'Invalid subdomain',
                message: 'Access denied. Invalid company domain.'
            })
        }

        const company = result[0]
        
        // Check if company is inactive
        if (company.inactive) {
            logger.warn(`Access attempt to inactive company: ${subdomain}`)
            return res.status(403).json({
                error: 'Company Inactive',
                message: 'Access denied. Company account is inactive.'
            })
        }

        // Get or create the dynamic data source for this subdomain
        const dynamicDataSource = DynamicDataSource.getInstance()
        const dataSource = await dynamicDataSource.getDataSource(subdomain)

        // Add the validated company info and data source to the request for later use
        req.subdomain = subdomain
        req.company = company
        req.dataSource = dataSource
        next()
    } catch (error) {
        logger.error('Error validating subdomain:', error)
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Error validating company domain.'
        })
    }
} 