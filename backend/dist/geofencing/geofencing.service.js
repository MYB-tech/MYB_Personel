"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofencingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const apartment_entity_1 = require("../entities/apartment.entity");
let GeofencingService = class GeofencingService {
    aptRepo;
    configService;
    radiusMeters;
    constructor(aptRepo, configService) {
        this.aptRepo = aptRepo;
        this.configService = configService;
        this.radiusMeters = this.configService.get('GEOFENCE_RADIUS_METERS', 20);
    }
    async checkDistance(apartmentId, lng, lat) {
        const result = await this.aptRepo
            .createQueryBuilder('apartment')
            .select(`ST_Distance(
          apartment.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        )`, 'distance')
            .where('apartment.id = :id', { id: apartmentId })
            .setParameters({ lng, lat })
            .getRawOne();
        if (!result) {
            throw new common_1.ForbiddenException('Apartman bulunamadı');
        }
        const distance = parseFloat(result.distance);
        return {
            distance_meters: Math.round(distance * 100) / 100,
            is_within_range: distance <= this.radiusMeters,
        };
    }
    async verifyProximity(apartmentId, lng, lat) {
        const check = await this.checkDistance(apartmentId, lng, lat);
        if (!check.is_within_range) {
            throw new common_1.ForbiddenException(`Apartmana çok uzaksınız (${check.distance_meters}m). Maksimum mesafe: ${this.radiusMeters}m`);
        }
        return check;
    }
};
exports.GeofencingService = GeofencingService;
exports.GeofencingService = GeofencingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(apartment_entity_1.Apartment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], GeofencingService);
//# sourceMappingURL=geofencing.service.js.map