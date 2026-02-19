import { Test, TestingModule } from '@nestjs/testing';
import { GeofencingService } from './geofencing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Apartment } from '../entities/apartment.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';

describe('GeofencingService', () => {
    let service: GeofencingService;
    let repo: Repository<Apartment>;

    // Mock Query Builder
    const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
    };

    const mockApartmentRepository = {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const mockConfigService = {
        get: jest.fn((key, defaultValue) => defaultValue),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeofencingService,
                {
                    provide: getRepositoryToken(Apartment),
                    useValue: mockApartmentRepository,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<GeofencingService>(GeofencingService);
        repo = module.get<Repository<Apartment>>(getRepositoryToken(Apartment));

        // Clear mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkDistance', () => {
        it('should return distance and is_within_range=true if distance is <= 20 meters', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ distance: 15 });

            const result = await service.checkDistance('apt-id', 29.0, 41.0);
            expect(result.is_within_range).toBe(true);
            expect(result.distance_meters).toBe(15);
            expect(repo.createQueryBuilder).toHaveBeenCalled();
        });

        it('should return distance and is_within_range=false if distance is > 20 meters', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ distance: 25 });

            const result = await service.checkDistance('apt-id', 29.0, 41.0);
            expect(result.is_within_range).toBe(false);
            expect(result.distance_meters).toBe(25);
        });

        it('should throw ForbiddenException if apartment not found', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValueOnce(null);

            await expect(service.checkDistance('apt-id', 29.0, 41.0))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    describe('verifyProximity', () => {
        it('should return result if within range', async () => {
            // Mock checkDistance internal call or just rely on the same mock setup
            // Since verifyProximity calls checkDistance, we can mock the repo response
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ distance: 10 });

            const result = await service.verifyProximity('apt-id', 29.0, 41.0);
            expect(result.is_within_range).toBe(true);
        });

        it('should throw ForbiddenException if NOT within range', async () => {
            mockQueryBuilder.getRawOne.mockResolvedValueOnce({ distance: 50 });

            await expect(service.verifyProximity('apt-id', 29.0, 41.0))
                .rejects
                .toThrow(ForbiddenException);
        });
    });
});
