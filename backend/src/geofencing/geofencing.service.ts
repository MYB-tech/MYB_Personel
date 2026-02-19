import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Apartment } from '../entities/apartment.entity';

export interface DistanceCheckResult {
    distance_meters: number;
    is_within_range: boolean;
}

@Injectable()
export class GeofencingService {
    private readonly radiusMeters: number;

    constructor(
        @InjectRepository(Apartment)
        private readonly aptRepo: Repository<Apartment>,
        private readonly configService: ConfigService,
    ) {
        this.radiusMeters = this.configService.get<number>(
            'GEOFENCE_RADIUS_METERS',
            20,
        );
    }

    /**
     * PostGIS ST_Distance ile personel konumunu apartman konumuna
     * karşı doğrular.
     *
     * @param apartmentId - Hedef apartman UUID
     * @param lng - Personel cihazının boylam değeri
     * @param lat - Personel cihazının enlem değeri
     * @returns DistanceCheckResult — mesafe ve izin durumu
     */
    async checkDistance(
        apartmentId: string,
        lng: number,
        lat: number,
    ): Promise<DistanceCheckResult> {
        const result = await this.aptRepo
            .createQueryBuilder('apartment')
            .select(
                `ST_Distance(
          apartment.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )`,
                'distance',
            )
            .where('apartment.id = :id', { id: apartmentId })
            .setParameters({ lng, lat })
            .getRawOne();

        if (!result) {
            throw new ForbiddenException('Apartman bulunamadı');
        }

        const distance = parseFloat(result.distance);

        return {
            distance_meters: Math.round(distance * 100) / 100,
            is_within_range: distance <= this.radiusMeters,
        };
    }

    /**
     * checkDistance sonucunu doğrular ve izin yoksa ForbiddenException atar.
     */
    async verifyProximity(
        apartmentId: string,
        lng: number,
        lat: number,
    ): Promise<DistanceCheckResult> {
        const check = await this.checkDistance(apartmentId, lng, lat);

        if (!check.is_within_range) {
            throw new ForbiddenException(
                `Apartmana çok uzaksınız (${check.distance_meters}m). Maksimum mesafe: ${this.radiusMeters}m`,
            );
        }

        return check;
    }
}
