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
var WhatsappProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const meta_api_client_1 = require("./meta-api.client");
const resident_entity_1 = require("../entities/resident.entity");
let WhatsappProcessor = WhatsappProcessor_1 = class WhatsappProcessor {
    metaApi;
    residentRepo;
    logger = new common_1.Logger(WhatsappProcessor_1.name);
    constructor(metaApi, residentRepo) {
        this.metaApi = metaApi;
        this.residentRepo = residentRepo;
    }
    async handleTaskStarted(job) {
        const { apartmentId, taskType, staffName, startedAt } = job.data;
        this.logger.log(`WhatsApp bildirimi işleniyor: Apartman ${apartmentId}, Görev: ${taskType}`);
        const residents = await this.residentRepo.find({
            where: { apartment_id: apartmentId },
        });
        if (residents.length === 0) {
            this.logger.warn(`Apartman ${apartmentId} için sakin bulunamadı`);
            return;
        }
        const results = await Promise.allSettled(residents.map((resident) => this.metaApi.sendTemplateMessage(resident.phone, 'task_started_notification', 'tr', [
            { type: 'text', text: taskType },
            { type: 'text', text: staffName || 'Personel' },
            {
                type: 'text',
                text: new Date(startedAt).toLocaleTimeString('tr-TR'),
            },
        ])));
        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        this.logger.log(`WhatsApp bildirimi tamamlandı: ${sent} başarılı, ${failed} başarısız`);
    }
    async handleBulkAnnouncement(job) {
        const { phone, templateName, parameters } = job.data;
        try {
            await this.metaApi.sendTemplateMessage(phone, templateName, 'tr', parameters);
            this.logger.log(`Duyuru mesajı gönderildi: ${phone}`);
        }
        catch (error) {
            this.logger.error(`Duyuru mesajı gönderilemedi: ${phone}`);
            throw error;
        }
    }
};
exports.WhatsappProcessor = WhatsappProcessor;
__decorate([
    (0, bull_1.Process)('task-started'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappProcessor.prototype, "handleTaskStarted", null);
__decorate([
    (0, bull_1.Process)('bulk-announcement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappProcessor.prototype, "handleBulkAnnouncement", null);
exports.WhatsappProcessor = WhatsappProcessor = WhatsappProcessor_1 = __decorate([
    (0, bull_1.Processor)('whatsapp'),
    __param(1, (0, typeorm_1.InjectRepository)(resident_entity_1.Resident)),
    __metadata("design:paramtypes", [meta_api_client_1.MetaApiClient,
        typeorm_2.Repository])
], WhatsappProcessor);
//# sourceMappingURL=whatsapp.processor.js.map