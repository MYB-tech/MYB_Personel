import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
export declare class StaffService {
    private readonly staffRepo;
    constructor(staffRepo: Repository<Staff>);
    findAll(): Promise<Staff[]>;
    findOne(id: string): Promise<Staff>;
    findByPhone(phone: string): Promise<Staff | null>;
    create(dto: CreateStaffDto): Promise<Staff>;
    update(id: string, dto: UpdateStaffDto): Promise<Staff>;
    remove(id: string): Promise<void>;
}
