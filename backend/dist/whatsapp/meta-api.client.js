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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MetaApiClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaApiClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let MetaApiClient = MetaApiClient_1 = class MetaApiClient {
    configService;
    logger = new common_1.Logger(MetaApiClient_1.name);
    client;
    phoneNumberId;
    constructor(configService) {
        this.configService = configService;
        const token = this.configService.get('META_WHATSAPP_TOKEN', '');
        const apiUrl = this.configService.get('META_WHATSAPP_API_URL', 'https://graph.facebook.com/v21.0');
        this.phoneNumberId = this.configService.get('META_PHONE_NUMBER_ID', '');
        this.client = axios_1.default.create({
            baseURL: apiUrl,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async sendTemplateMessage(to, templateName, languageCode = 'tr', parameters = []) {
        try {
            const body = {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                },
            };
            if (parameters.length > 0) {
                body.template.components = [
                    {
                        type: 'body',
                        parameters: parameters.map((p) => ({
                            type: p.type,
                            text: p.text,
                        })),
                    },
                ];
            }
            const response = await this.client.post(`/${this.phoneNumberId}/messages`, body);
            this.logger.log(`WhatsApp mesaj gönderildi: ${to}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`WhatsApp mesaj gönderilemedi: ${error?.response?.data?.error?.message || error.message}`);
            throw error;
        }
    }
};
exports.MetaApiClient = MetaApiClient;
exports.MetaApiClient = MetaApiClient = MetaApiClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MetaApiClient);
//# sourceMappingURL=meta-api.client.js.map