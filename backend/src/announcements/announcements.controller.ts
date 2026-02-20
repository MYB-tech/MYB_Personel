import {
    Controller,
    Post,
    Body,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import * as XLSX from 'xlsx';

interface ExcelRow {
    Ad: string;
    Soyad?: string;
    Bina?: string;
    'Daire No'?: string | number;
    Tel: string;
    Bakiye: string | number;
}

@Controller('announcements')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AnnouncementsController {
    private readonly logger = new Logger(AnnouncementsController.name);

    constructor(
        @InjectQueue('whatsapp')
        private readonly whatsappQueue: Queue,
    ) { }

    @Post('preview')
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file'))
    async preview(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Dosya yüklenmedi');

        const rows = this.parseExcel(file.buffer);
        const valid: ExcelRow[] = [];
        const invalid: { row: number; data: any; error: string }[] = [];

        rows.forEach((row, index) => {
            const errors: string[] = [];
            if (!row.Ad) errors.push('Ad eksik');
            if (!row.Tel) errors.push('Telefon numarası eksik');
            if (row.Tel && !/^\d{10,15}$/.test(row.Tel.toString().replace(/\D/g, ''))) {
                errors.push('Geçersiz telefon formatı');
            }
            if (row.Bakiye === undefined || row.Bakiye === null) {
                errors.push('Bakiye eksik');
            }

            if (errors.length > 0) {
                invalid.push({ row: index + 2, data: row, error: errors.join(', ') });
            } else {
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

    @Post('send')
    @Roles('admin')
    async sendBulk(
        @Body()
        body: {
            recipients: ExcelRow[];
            messageTemplate: string;
        },
    ) {
        if (!body.recipients || body.recipients.length === 0) {
            throw new BadRequestException('Alıcı listesi boş');
        }

        // Her alıcı için kuyruğa ekle
        const jobPromises = body.recipients.map((row) =>
            this.whatsappQueue.add('bulk-announcement', {
                phone: row.Tel,
                recipientData: row,
                messageTemplate: body.messageTemplate,
            }),
        );

        await Promise.all(jobPromises);
        this.logger.log(`${body.recipients.length} mesaj kuyruğa eklendi`);

        return {
            message: `${body.recipients.length} mesaj kuyruğa eklendi`,
            queued_count: body.recipients.length,
        };
    }

    private parseExcel(buffer: Buffer): ExcelRow[] {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json<ExcelRow>(sheet);
    }
}
