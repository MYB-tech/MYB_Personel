import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaApiClient } from './meta-api.client';
import { Resident, ResidentType } from '../entities/resident.entity';
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
        const allResidents = await this.residentRepo.find({
            where: { apartment_id: apartmentId },
        });

        if (allResidents.length === 0) {
            this.logger.warn(`Apartman ${apartmentId} için sakin bulunamadı`);
            return;
        }

        // Birim bazlı filtreleme: Varsa kiracı, yoksa ev sahibi
        const unitGroups: Record<string, Resident[]> = {};
        allResidents.forEach(r => {
            const unit = r.unit_number || 'default';
            if (!unitGroups[unit]) unitGroups[unit] = [];
            unitGroups[unit].push(r);
        });

        const targetResidents: Resident[] = [];
        Object.values(unitGroups).forEach(group => {
            const tenant = group.find(r => r.type === ResidentType.TENANT);
            if (tenant) {
                targetResidents.push(tenant);
            } else {
                const owner = group.find(r => r.type === ResidentType.OWNER);
                if (owner) targetResidents.push(owner);
            }
        });

        // Mesaj şablonunu belirle
        let template: MessageTemplate | null = null;
        if (messageTemplateId) {
            template = await this.templateRepo.findOne({ where: { id: messageTemplateId } });
        }

        const taskTypeTranslated = this.translateTaskType(taskType);
        const startTime = new Date(startedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        const results = await Promise.allSettled(
            targetResidents.map((resident) => {
                if (template) {
                    return this.sendPersonalizedMessage(resident, template, {
                        taskType: taskTypeTranslated,
                        staffName: staffName || 'Personel',
                        startTime: startTime
                    });
                } else {
                    // Varsayılan şablon (Fallback)
                    return this.metaApi.sendTemplateMessage(
                        resident.phone,
                        'task_started_notification',
                        'tr',
                        [
                            { type: 'text', text: taskTypeTranslated },
                            { type: 'text', text: staffName || 'Personel' },
                            { type: 'text', text: startTime },
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

    private translateTaskType(type: string): string {
        const translations: Record<string, string> = {
            'garbage': 'Çöp Toplama',
            'cleaning': 'Temizlik',
            'security': 'Güvenlik Turu',
        };
        return translations[type.toLowerCase()] || type;
    }

    private async sendPersonalizedMessage(resident: Resident, template: MessageTemplate, data: any) {
        const replacements: Record<string, string> = {
            '<ad>': resident.first_name || '',
            '<soyad>': resident.last_name || '',
            '<daire_no>': resident.unit_number || '',
            '<gorev_turu>': data.taskType,
            '<personel_adi>': data.staffName,
            '<baslangic_saati>': data.startTime,
        };

        if (template.is_meta && template.meta_template_name) {
            const placeholderRegex = /<[^>]+>/g;
            const matches = (template.content.match(placeholderRegex) || []) as string[];
            const parameters = matches.map((tag: string) => {
                const value = replacements[tag.toLowerCase()] || '';
                return { type: 'text' as const, text: value };
            });

            return this.metaApi.sendTemplateMessage(
                resident.phone,
                template.meta_template_name,
                template.meta_language || 'tr',
                parameters
            );
        } else {
            let personalizedMessage = template.content;
            for (const [placeholder, value] of Object.entries(replacements)) {
                personalizedMessage = personalizedMessage.replace(
                    new RegExp(placeholder, 'gi'),
                    value,
                );
            }
            return this.metaApi.sendTextMessage(resident.phone, personalizedMessage);
        }
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
