import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Task, TaskStatus } from '../entities/task.entity';
import { TaskLog } from '../entities/task-log.entity';
import { GeofencingService } from '../geofencing/geofencing.service';
import { TaskDefinitionsService } from '../task-definitions/task-definitions.service';
import { CreateTaskDto, StartTaskDto, CompleteTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,
        @InjectRepository(TaskLog)
        private readonly logRepo: Repository<TaskLog>,
        private readonly geofencingService: GeofencingService,
        private readonly taskDefinitionsService: TaskDefinitionsService,
        @InjectQueue('whatsapp')
        private readonly whatsappQueue: Queue,
    ) { }

    /* ─── CRUD ──────────────────────────────────────────── */

    async findAll(): Promise<Task[]> {
        return this.taskRepo.find({
            relations: ['staff', 'apartment'],
            order: { created_at: 'DESC' },
        });
    }

    async findByStaff(staffId: string): Promise<Task[]> {
        return this.taskRepo.find({
            where: { staff_id: staffId },
            relations: ['apartment'],
            order: { schedule_start: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['staff', 'apartment'],
        });
        if (!task) throw new NotFoundException('Görev bulunamadı');
        return task;
    }

    /**
     * Görev oluşturma — çakışma kontrolü ile birlikte
     */
    async create(dto: CreateTaskDto): Promise<Task> {
        // Çakışma kontrolü: Aynı personel, aynı gün, aynı zaman dilimi
        await this.checkConflict(
            dto.staff_id,
            dto.scheduled_days,
            dto.schedule_start,
            dto.schedule_end,
        );

        const task = this.taskRepo.create({
            staff_id: dto.staff_id,
            apartment_id: dto.apartment_id,
            type: dto.type,
            scheduled_days: dto.scheduled_days,
            schedule_start: dto.schedule_start,
            schedule_end: dto.schedule_end,
            status: TaskStatus.PENDING,
        });

        return this.taskRepo.save(task);
    }

    async remove(id: string): Promise<void> {
        const task = await this.findOne(id);
        await this.taskRepo.remove(task);
    }

    /* ─── GÖREV BAŞLATMA ────────────────────────────────── */

    async startTask(taskId: string, staffId: string, dto: StartTaskDto) {
        const task = await this.findOne(taskId);

        // Yetki kontrolü
        if (task.staff_id !== staffId) {
            throw new ForbiddenException('Bu görevi başlatma yetkiniz yok');
        }

        // Durum kontrolü
        if (task.status !== TaskStatus.PENDING) {
            throw new ConflictException('Bu görev zaten başlatılmış veya tamamlanmış');
        }

        // Geofencing doğrulaması (≤ 20m)
        const distanceCheck = await this.geofencingService.verifyProximity(
            task.apartment_id,
            dto.longitude,
            dto.latitude,
        );

        // Gecikme kontrolü
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const isLate = currentTime > task.schedule_end;

        // Görevi güncelle
        task.status = isLate ? TaskStatus.LATE : TaskStatus.IN_PROGRESS;
        task.is_late = isLate;
        task.started_at = now;
        await this.taskRepo.save(task);

        // Log kaydı
        const log = this.logRepo.create({
            task_id: taskId,
            staff_id: staffId,
            action: 'START',
            location: {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            },
            distance_meters: distanceCheck.distance_meters,
        });
        await this.logRepo.save(log);

        // WhatsApp bildirim kuyruğuna ekle
        try {
            const taskDefinition = await this.taskDefinitionsService.findByCode(task.type);

            await this.whatsappQueue.add('task-started', {
                taskId: task.id,
                apartmentId: task.apartment_id,
                taskType: task.type,
                staffName: task.staff?.name,
                startedAt: now.toISOString(),
                messageTemplateId: taskDefinition?.message_template_id,
            });
            this.logger.log(`WhatsApp bildirim kuyruğa eklendi: görev ${taskId}`);
        } catch (err) {
            this.logger.warn(`WhatsApp kuyruğuna eklenemedi: ${err}`);
        }

        return {
            message: isLate
                ? 'Görev gecikmeli olarak başlatıldı. Daire sakinlerine WhatsApp bildirimi gönderiliyor.'
                : 'Görev başarıyla başlatıldı. Daire sakinlerine WhatsApp bildirimi gönderiliyor.',
            task,
            distance_meters: distanceCheck.distance_meters,
            is_late: isLate,
        };
    }

    /* ─── GÖREV TAMAMLAMA ───────────────────────────────── */

    async completeTask(taskId: string, staffId: string, dto: CompleteTaskDto) {
        const task = await this.findOne(taskId);

        if (task.staff_id !== staffId) {
            throw new ForbiddenException('Bu görevi tamamlama yetkiniz yok');
        }

        if (
            task.status !== TaskStatus.IN_PROGRESS &&
            task.status !== TaskStatus.LATE
        ) {
            throw new ConflictException('Bu görev henüz başlatılmamış');
        }

        task.status = task.is_late ? TaskStatus.LATE : TaskStatus.COMPLETED;
        task.completed_at = new Date();
        await this.taskRepo.save(task);

        // Log kaydı
        const log = this.logRepo.create({
            task_id: taskId,
            staff_id: staffId,
            action: 'COMPLETE',
            location: dto.latitude
                ? {
                    type: 'Point',
                    coordinates: [dto.longitude!, dto.latitude],
                }
                : null,
        });
        await this.logRepo.save(log);

        return {
            message: 'Görev tamamlandı',
            task,
        };
    }

    /* ─── YARDIMCI METOTLAR ─────────────────────────────── */

    /**
     * Çakışma kontrolü: Aynı personele aynı gün ve zaman diliminde
     * farklı lokasyonda görev atanamaz.
     */
    private async checkConflict(
        staffId: string,
        days: string[],
        start: string,
        end: string,
        excludeTaskId?: string,
    ) {
        const qb = this.taskRepo
            .createQueryBuilder('task')
            .where('task.staff_id = :staffId', { staffId })
            .andWhere('task.scheduled_days && :days', { days })
            .andWhere(
                '(task.schedule_start, task.schedule_end) OVERLAPS (:start::time, :end::time)',
                { start, end },
            );

        if (excludeTaskId) {
            qb.andWhere('task.id != :excludeId', { excludeId: excludeTaskId });
        }

        const conflict = await qb.getOne();

        if (conflict) {
            throw new ConflictException(
                `Bu personelin belirtilen zaman diliminde zaten bir görevi var (Görev #${conflict.id})`,
            );
        }
    }
}
