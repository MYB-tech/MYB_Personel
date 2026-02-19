import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Apartment } from '../entities/apartment.entity';
export interface DistanceCheckResult {
    distance_meters: number;
    is_within_range: boolean;
}
export declare class GeofencingService {
    private readonly aptRepo;
    private readonly configService;
    private readonly radiusMeters;
    constructor(aptRepo: Repository<Apartment>, configService: ConfigService);
    checkDistance(apartmentId: string, lng: number, lat: number): Promise<DistanceCheckResult>;
    verifyProximity(apartmentId: string, lng: number, lat: number): Promise<DistanceCheckResult>;
}
