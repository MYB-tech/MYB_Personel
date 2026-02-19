import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    findAll(): Promise<import("../entities").Staff[]>;
    findOne(id: string): Promise<import("../entities").Staff>;
    create(dto: CreateStaffDto): Promise<import("../entities").Staff>;
    update(id: string, dto: UpdateStaffDto): Promise<import("../entities").Staff>;
    remove(id: string): Promise<void>;
}
