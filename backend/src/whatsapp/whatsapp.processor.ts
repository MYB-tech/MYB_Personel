import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaApiClient } from './meta-api.client';
import { Resident } from '../entities/resident.entity';
import { MessageTemplate } from '../entities/message-template.entity';

@Processor('whatsapp')
export class WhatsappProcessor {
    private readonly logger = new Logger(WhatsappProcessor.name);

    constructor(
        private readonly metaApi: MetaApiClient,
        @InjectRepository(Resident)
        private readonly residentRepo: Repository<Resident>,
        @InjectRepository(MessageTemplate)
        private readonly templateRepo: Repository<MessageTemplate>,
    ) { }

    @Process('task-started')
    async handleTaskStarted(job: Job) {
        const { apartmentId, taskType, staffName, startedAt, messageTemplateId } = job.data;

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

        let template: MessageTemplate | null = null;
        if (messageTemplateId) {
            template = await this.templateRepo.findOne({ where: { id: messageTemplateId } });
        }

        // Her sakin için mesaj gönder
        const results = await Promise.allSettled(
            residents.map((resident) => {
                if (template) {
                    if (template.is_meta && template.meta_template_name) {
                        return this.metaApi.sendTemplateMessage(
                            resident.phone,
                            template.meta_template_name,
                            template.meta_language || 'tr',
                            [
                                { type: 'text', text: taskType },
                                { type: 'text', text: staffName || 'Personel' },
                                {
                                    type: 'text',
                                    text: new Date(startedAt).toLocaleTimeString('tr-TR'),
                                },
                            ],
                        );
                    } else {
                        // Free text personalized message
                        let personalizedMessage = template.content;
                        personalizedMessage = personalizedMessage
                            .replace(/<ad>/gi, resident.name.split(' ')[0])
                            .replace(/<soyad>/gi, resident.name.split(' ').slice(1).join(' '))
                            .replace(/<görev>/gi, taskType)
                            .replace(/<personel>/gi, staffName || 'Personel')
                            .replace(/<saat>/gi, new Date(startedAt).toLocaleTimeString('tr-TR'));

                        return this.metaApi.sendTextMessage(resident.phone, personalizedMessage);
                    }
                } else {
                    // Fallback to default template
                    return this.metaApi.sendTemplateMessage(
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
                    );
                }
            }),
        );

        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        this.logger.log(
            `WhatsApp bildirimi tamamlandı: ${sent} başarılı, ${failed} başarısız`,
        );
    }

    @Process('bulk-announcement')
    async handleBulkAnnouncement(job: Job) {
        const { phone, recipientData, messageTemplate, isMeta, metaTemplateName, metaLanguage } = job.data;

        try {
            const replacements = {
                '<ad>': recipientData.Ad || '',
                '<soyad>': recipientData.Soyad || '',
                '<bina>': recipientData.Apartman || recipientData.Bina || '',
                '<apartman>': recipientData.Apartman || recipientData.Bina || '',
                '<daire_no>': recipientData['Daire No'] || '',
                '<tel>': recipientData.Tel || '',
                '<tel_no>': recipientData.Tel || '',
                '<bakiye>': recipientData.Bakiye?.toString() || '0',
            };

            if (isMeta && metaTemplateName) {
                // Find all placeholders in messageTemplate to determine parameter order
                const placeholderRegex = /<[^>]+>/g;
                const matches = (messageTemplate.match(placeholderRegex) || []) as string[];
                const parameters = matches.map((tag: string) => {
                    const value = (replacements as any)[tag.toLowerCase()] || '';
                    return { type: 'text' as const, text: value };
                });

                await this.metaApi.sendTemplateMessage(
                    phone,
                    metaTemplateName,
                    metaLanguage || 'tr',
                    parameters
                );
            } else {
                // Placeholder replacement for free text
                let personalizedMessage = messageTemplate;
                for (const [placeholder, value] of Object.entries(replacements)) {
                    personalizedMessage = personalizedMessage.replace(
                        new RegExp(placeholder, 'gi'),
                        value,
                    );
                }
                await this.metaApi.sendTextMessage(phone, personalizedMessage);
            }

            this.logger.log(`Duyuru mesajı gönderildi: ${phone}`);
        } catch (error) {
            this.logger.error(`Duyuru mesajı gönderilemedi: ${phone}`);
            throw error;
        }
    }
}
