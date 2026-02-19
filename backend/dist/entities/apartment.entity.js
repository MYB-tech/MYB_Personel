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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Apartment = void 0;
const typeorm_1 = require("typeorm");
const resident_entity_1 = require("./resident.entity");
const task_entity_1 = require("./task.entity");
let Apartment = class Apartment {
    id;
    name;
    address;
    location;
    residents;
    tasks;
    created_at;
    updated_at;
};
exports.Apartment = Apartment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Apartment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Apartment.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Apartment.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    }),
    __metadata("design:type", Object)
], Apartment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => resident_entity_1.Resident, (r) => r.apartment, { cascade: true }),
    __metadata("design:type", Array)
], Apartment.prototype, "residents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (t) => t.apartment),
    __metadata("design:type", Array)
], Apartment.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Apartment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Apartment.prototype, "updated_at", void 0);
exports.Apartment = Apartment = __decorate([
    (0, typeorm_1.Entity)('apartments')
], Apartment);
//# sourceMappingURL=apartment.entity.js.map