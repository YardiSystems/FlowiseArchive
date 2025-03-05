import { Request, Response, NextFunction } from 'express'

declare global {
    namespace Express {
        interface Request {
            queryStore?: { [key: string]: any }
        }
    }
}

/**
 * Middleware to store query parameters in memory for the life of the request
 */
export const queryParamsStore = (req: Request, res: Response, next: NextFunction) => {
    // Store query parameters in request object
    req.queryStore = { ...req.query }
    next()
} 