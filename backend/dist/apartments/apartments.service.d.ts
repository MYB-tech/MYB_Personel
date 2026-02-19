import { Repository } from 'typeorm';
import { Apartment } from '../entities/apartment.entity';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
export declare class ApartmentsService {
    private readonly aptRepo;
    constructor(aptRepo: Repository<Apartment>);
    findAll(): Promise<Apartment[]>;
    findOne(id: string): Promise<Apartment>;
    create(dto: CreateApartmentDto): Promise<Apartment>;
    update(id: string, dto: UpdateApartmentDto): Promise<Apartment>;
    remove(id: string): Promise<void>;
}
