import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDefinition } from '../entities/task-definition.entity';
import { CreateTaskDefinitionDto, UpdateTaskDefinitionDto } from './dto/task-definition.dto';

@Injectable()
export class TaskDefinitionsService {
    constructor(
        @InjectRepository(TaskDefinition)
        private readonly repo: Repository<TaskDefinition>,
    ) { }

    async findAll(): Promise<TaskDefinition[]> {
        return this.repo.find({
            relations: ['message_template'],
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<TaskDefinition> {
        const def = await this.repo.findOne({
            where: { id },
            relations: ['message_template'],
        });
        if (!def) throw new NotFoundException('Görev tanımı bulunamadı');
        return def;
    }

    async findByCode(code: string): Promise<TaskDefinition | null> {
        return this.repo.findOne({
            where: { code },
            relations: ['message_template'],
        });
    }

    async create(dto: CreateTaskDefinitionDto): Promise<TaskDefinition> {
        if (!dto.code) {
            dto.code = this.slugify(dto.name);
        }

        const existing = await this.repo.findOne({ where: { code: dto.code } });
        if (existing) {
            // Eğer kod çakışıyorsa sonuna timestamp ekle
            dto.code = `${dto.code}-${Date.now().toString().slice(-4)}`;
        }

        const def = this.repo.create(dto);
        return this.repo.save(def);
    }

    private slugify(text: string): string {
        const trMap: any = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
        };
        let slug = text;
        for (const key in trMap) {
            slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
        }
        return slug
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    }

    async update(id: string, dto: UpdateTaskDefinitionDto): Promise<TaskDefinition> {
        const def = await this.findOne(id);
        Object.assign(def, dto);
        return this.repo.save(def);
    }

    async remove(id: string): Promise<void> {
        const def = await this.findOne(id);
        await this.repo.remove(def);
    }

    async seed() {
        const defaults = [
            { name: 'Çöp Toplama', code: 'garbage', icon: 'delete_outline' },
            { name: 'Temizlik', code: 'cleaning', icon: 'cleaning_services' },
            { name: 'Güvenlik Turu', code: 'security', icon: 'security' },
        ];

        for (const item of defaults) {
            const existing = await this.repo.findOne({ where: { code: item.code } });
            if (!existing) {
                await this.repo.save(this.repo.create(item));
            }
        }
    }
}
