import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
export declare class AuthService {
    private readonly staffRepo;
    private readonly jwtService;
    constructor(staffRepo: Repository<Staff>, jwtService: JwtService);
    login(phone: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            phone: string;
            role: string;
        };
    }>;
    validateUser(userId: string): Promise<Staff | null>;
}
