import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaApiClient } from './meta-api.client';
import { Resident } from '../entities/resident.entity';

@Processor('whatsapp')
export class WhatsappProcessor {
    private readonly logger = new Logger(WhatsappProcessor.name);

    constructor(
        private readonly metaApi: MetaApiClient,
        @InjectRepository(Resident)
        private readonly residentRepo: Repository<Resident>,
    ) { }

    @Process('task-started')
    async handleTaskStarted(job: Job) {
        const { apartmentId, taskType, staffName, startedAt } = job.data;

        this.logger.log(
            `WhatsApp bildirimi işleniyor: Apartman ${apartmentId}, Görev: ${taskType}`,
        );

        // Apartmandaki tüm sakinleri çek
        const residents = await this.residentRepo.find({
            where: { apartment_id: apartmentId },
        });

        if (residents.length === 0) {
            this.logger.warn(`Apartman ${apartmentId} için sakin bulunamadı`);
            return;
        }

        // Her sakin için şablon mesaj gönder
        const results = await Promise.allSettled(
            residents.map((resident) =>
                this.metaApi.sendTemplateMessage(
                    resident.phone,
                    'task_started_notification',
                    'tr',
                    [
                        { type: 'text', text: taskType },
                        { type: 'text', text: staffName || 'Personel' },
                        {
                            type: 'text',
                            text: new Date(startedAt).toLocaleTimeString('tr-TR'),
                        },
                    ],
                ),
            ),
        );

        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        this.logger.log(
            `WhatsApp bildirimi tamamlandı: ${sent} başarılı, ${failed} başarısız`,
        );
    }

    @Process('bulk-announcement')
    async handleBulkAnnouncement(job: Job) {
        const { phone, recipientData, messageTemplate } = job.data;

        try {
            // Placeholder replacement
            let personalizedMessage = messageTemplate;
            const replacements = {
                '<ad>': recipientData.Ad || '',
                '<soyad>': recipientData.Soyad || '',
                '<bina>': recipientData.Bina || '',
                '<daire_no>': recipientData['Daire No'] || '',
                '<tel>': recipientData.Tel || '',
                '<bakiye>': recipientData.Bakiye?.toString() || '0',
            };

            for (const [placeholder, value] of Object.entries(replacements)) {
                personalizedMessage = personalizedMessage.replace(
                    new RegExp(placeholder, 'gi'),
                    value,
                );
            }

            await this.metaApi.sendTextMessage(phone, personalizedMessage);
            this.logger.log(`Duyuru mesajı gönderildi: ${phone}`);
        } catch (error) {
            this.logger.error(`Duyuru mesajı gönderilemedi: ${phone}`);
            throw error;
        }
    }
}
