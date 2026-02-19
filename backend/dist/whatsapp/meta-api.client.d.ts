import { ConfigService } from '@nestjs/config';
export declare class MetaApiClient {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly phoneNumberId;
    constructor(configService: ConfigService);
    sendTemplateMessage(to: string, templateName: string, languageCode?: string, parameters?: {
        type: string;
        text: string;
    }[]): Promise<any>;
}
