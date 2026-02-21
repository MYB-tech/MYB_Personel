import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTemplate } from '../entities/message-template.entity';

@Injectable()
export class MessageTemplatesService {
    constructor(
        @InjectRepository(MessageTemplate)
        private readonly templateRepo: Repository<MessageTemplate>,
    ) { }

    async findAll(): Promise<MessageTemplate[]> {
        return this.templateRepo.find({ order: { created_at: 'DESC' } });
    }

    async findOne(id: number): Promise<MessageTemplate> {
        const template = await this.templateRepo.findOne({ where: { id } });
        if (!template) throw new NotFoundException('Şablon bulunamadı');
        return template;
    }

    async create(data: Partial<MessageTemplate>): Promise<MessageTemplate> {
        const template = this.templateRepo.create(data);
        return this.templateRepo.save(template);
    }

    async update(id: number, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
        await this.findOne(id);
        await this.templateRepo.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const template = await this.findOne(id);
        await this.templateRepo.remove(template);
    }
}
