import { Apartment } from './apartment.entity';
export declare class Resident {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    apartment: Apartment;
    apartment_id: string;
    created_at: Date;
}
