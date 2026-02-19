import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MetaApiClient {
    private readonly logger = new Logger(MetaApiClient.name);
    private readonly client: AxiosInstance;
    private readonly phoneNumberId: string;

    constructor(private readonly configService: ConfigService) {
        const token = this.configService.get<string>('META_WHATSAPP_TOKEN', '');
        const apiUrl = this.configService.get<string>(
            'META_WHATSAPP_API_URL',
            'https://graph.facebook.com/v21.0',
        );
        this.phoneNumberId = this.configService.get<string>(
            'META_PHONE_NUMBER_ID',
            '',
        );

        this.client = axios.create({
            baseURL: apiUrl,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Onaylanmış Meta şablon mesajı gönderir.
     *
     * @param to - Alıcı telefon numarası (uluslararası formatta, ör: 905551234567)
     * @param templateName - Meta Business'da tanımlı şablon adı
     * @param languageCode - Şablon dili (ör: 'tr')
     * @param parameters - Şablon parametreleri (body bileşeni)
     */
    async sendTemplateMessage(
        to: string,
        templateName: string,
        languageCode = 'tr',
        parameters: { type: string; text: string }[] = [],
    ) {
        try {
            const body: any = {
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

            const response = await this.client.post(
                `/${this.phoneNumberId}/messages`,
                body,
            );

            this.logger.log(`WhatsApp mesaj gönderildi: ${to}`);
            return response.data;
        } catch (error: any) {
            this.logger.error(
                `WhatsApp mesaj gönderilemedi: ${error?.response?.data?.error?.message || error.message}`,
            );
            throw error;
        }
    }
}
