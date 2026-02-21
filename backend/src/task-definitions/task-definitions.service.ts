import { Injectable, NotFoundException } from '@nestjs/common';
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
            order: { name: 'ASC' }
        });
    }

    async findOne(id: string): Promise<TaskDefinition> {
        const def = await this.repo.findOne({
            where: { id },
            relations: ['message_template']
        });
        if (!def) throw new NotFoundException('Görev tanımı bulunamadı');
        return def;
    }

    async create(dto: CreateTaskDefinitionDto): Promise<TaskDefinition> {
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

    /**
     * Seed initial definitions if none exist
     */
    async onModuleInit() {
        const count = await this.repo.count();
        if (count === 0) {
            const initial = [
                { name: 'Çöp Toplama', icon: 'delete_outline' },
                { name: 'Temizlik', icon: 'cleaning_services' },
                { name: 'Bahçe Bakımı', icon: 'yard' },
                { name: 'Güvenlik Kontrolü', icon: 'security' },
            ];
            for (const def of initial) {
                await this.repo.save(this.repo.create(def));
            }
        }
    }
}
