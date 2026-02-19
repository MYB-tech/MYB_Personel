import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
export declare class ApartmentsController {
    private readonly aptService;
    constructor(aptService: ApartmentsService);
    findAll(): Promise<import("../entities").Apartment[]>;
    findOne(id: string): Promise<import("../entities").Apartment>;
    create(dto: CreateApartmentDto): Promise<import("../entities").Apartment>;
    update(id: string, dto: UpdateApartmentDto): Promise<import("../entities").Apartment>;
    remove(id: string): Promise<void>;
}
