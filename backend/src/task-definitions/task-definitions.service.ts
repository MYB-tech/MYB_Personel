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
        const existing = await this.repo.findOne({ where: { code: dto.code } });
        if (existing) throw new ConflictException('Bu kod ile zaten bir görev tanımı var');

        const def = this.repo.create(dto);
        return this.repo.save(def);
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
