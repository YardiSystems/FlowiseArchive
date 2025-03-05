import { DataSource } from 'typeorm'

declare global {
    namespace Express {
        interface Request {
            subdomain?: string;
            company?: {
                id: string;
                name: string;
                domain: string;
                inactive: boolean;
                status: string;
                issingledomain: boolean;
                isinternal: boolean;
                allowcustommenus: boolean;
                issql: boolean;
                authenticationmode: string;
                yardioneurl: string;
                yardipin: string;
                address: string;
                city: string;
                state: string;
                zipcode: string;
                phone: string;
                companylogo: string;
                createddate: Date;
                Address2: string;
                Country: string;
                Notes: string;
                IsOmniEnabled: boolean;
                guid: string;
                updateddate: Date;
                refreshtokenenabled: boolean;
                isfeemanagerclient: boolean;
                refreshtokenexpirystellarcasenumber: string;
                refreshtokenexpirydurationindays: number;
                displayreadonlycheckbox: boolean;
                IsReleaseException: boolean;
                virtuosoenabled: boolean;
                locationid: string;
            };
            dataSource?: DataSource;
        }
    }
} 