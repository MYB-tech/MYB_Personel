"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnnouncementsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const bull_1 = require("@nestjs/bull");
const bullmq_1 = require("bullmq");
const XLSX = __importStar(require("xlsx"));
let AnnouncementsController = AnnouncementsController_1 = class AnnouncementsController {
    whatsappQueue;
    logger = new common_1.Logger(AnnouncementsController_1.name);
    constructor(whatsappQueue) {
        this.whatsappQueue = whatsappQueue;
    }
    async preview(file) {
        if (!file)
            throw new common_1.BadRequestException('Dosya yüklenmedi');
        const rows = this.parseExcel(file.buffer);
        const valid = [];
        const invalid = [];
        rows.forEach((row, index) => {
            const errors = [];
            if (!row.Ad)
                errors.push('Ad eksik');
            if (!row.Tel)
                errors.push('Telefon numarası eksik');
            if (row.Tel && !/^\d{10,15}$/.test(row.Tel.replace(/\D/g, ''))) {
                errors.push('Geçersiz telefon formatı');
            }
            if (errors.length > 0) {
                invalid.push({ row: index + 2, data: row, error: errors.join(', ') });
            }
            else {
                valid.push(row);
            }
        });
        return {
            total: rows.length,
            valid_count: valid.length,
            invalid_count: invalid.length,
            valid,
            invalid,
        };
    }
    async sendBulk(body) {
        if (!body.recipients || body.recipients.length === 0) {
            throw new common_1.BadRequestException('Alıcı listesi boş');
        }
        const jobs = body.recipients.map((r) => ({
            name: 'bulk-announcement',
            data: {
                phone: r.phone,
                name: r.name,
                templateName: body.template_name,
                parameters: body.parameters || [],
            },
        }));
        await this.whatsappQueue.addBulk(jobs);
        this.logger.log(`${jobs.length} duyuru mesajı kuyruğa eklendi`);
        return {
            message: `${jobs.length} mesaj kuyruğa eklendi`,
            queued_count: jobs.length,
        };
    }
    parseExcel(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet);
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "sendBulk", null);
exports.AnnouncementsController = AnnouncementsController = AnnouncementsController_1 = __decorate([
    (0, common_1.Controller)('announcements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __param(0, (0, bull_1.InjectQueue)('whatsapp')),
    __metadata("design:paramtypes", [bullmq_1.Queue])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map