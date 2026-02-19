import { Queue } from 'bullmq';
interface ExcelRow {
    Ad: string;
    Soyad: string;
    Tel: string;
    Apartman: string;
}
export declare class AnnouncementsController {
    private readonly whatsappQueue;
    private readonly logger;
    constructor(whatsappQueue: Queue);
    preview(file: Express.Multer.File): Promise<{
        total: number;
        valid_count: number;
        invalid_count: number;
        valid: ExcelRow[];
        invalid: {
            row: number;
            data: any;
            error: string;
        }[];
    }>;
    sendBulk(body: {
        recipients: {
            phone: string;
            name: string;
        }[];
        template_name: string;
        parameters?: {
            type: string;
            text: string;
        }[];
    }): Promise<{
        message: string;
        queued_count: number;
    }>;
    private parseExcel;
}
export {};
