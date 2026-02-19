"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const task_entity_1 = require("../entities/task.entity");
const task_log_entity_1 = require("../entities/task-log.entity");
const geofencing_service_1 = require("../geofencing/geofencing.service");
let TasksService = TasksService_1 = class TasksService {
    taskRepo;
    logRepo;
    geofencingService;
    whatsappQueue;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(taskRepo, logRepo, geofencingService, whatsappQueue) {
        this.taskRepo = taskRepo;
        this.logRepo = logRepo;
        this.geofencingService = geofencingService;
        this.whatsappQueue = whatsappQueue;
    }
    async findAll() {
        return this.taskRepo.find({
            relations: ['staff', 'apartment'],
            order: { created_at: 'DESC' },
        });
    }
    async findByStaff(staffId) {
        return this.taskRepo.find({
            where: { staff_id: staffId },
            relations: ['apartment'],
            order: { schedule_start: 'ASC' },
        });
    }
    async findOne(id) {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['staff', 'apartment'],
        });
        if (!task)
            throw new common_1.NotFoundException('Görev bulunamadı');
        return task;
    }
    async create(dto) {
        await this.checkConflict(dto.staff_id, dto.scheduled_days, dto.schedule_start, dto.schedule_end);
        const task = this.taskRepo.create({
            staff_id: dto.staff_id,
            apartment_id: dto.apartment_id,
            type: dto.type,
            scheduled_days: dto.scheduled_days,
            schedule_start: dto.schedule_start,
            schedule_end: dto.schedule_end,
            status: task_entity_1.TaskStatus.PENDING,
        });
        return this.taskRepo.save(task);
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.taskRepo.remove(task);
    }
    async startTask(taskId, staffId, dto) {
        const task = await this.findOne(taskId);
        if (task.staff_id !== staffId) {
            throw new common_1.ForbiddenException('Bu görevi başlatma yetkiniz yok');
        }
        if (task.status !== task_entity_1.TaskStatus.PENDING) {
            throw new common_1.ConflictException('Bu görev zaten başlatılmış veya tamamlanmış');
        }
        const distanceCheck = await this.geofencingService.verifyProximity(task.apartment_id, dto.longitude, dto.latitude);
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const isLate = currentTime > task.schedule_end;
        task.status = isLate ? task_entity_1.TaskStatus.LATE : task_entity_1.TaskStatus.IN_PROGRESS;
        task.is_late = isLate;
        task.started_at = now;
        await this.taskRepo.save(task);
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
        try {
            await this.whatsappQueue.add('task-started', {
                taskId: task.id,
                apartmentId: task.apartment_id,
                taskType: task.type,
                staffName: task.staff?.name,
                startedAt: now.toISOString(),
            });
            this.logger.log(`WhatsApp bildirim kuyruğa eklendi: görev ${taskId}`);
        }
        catch (err) {
            this.logger.warn(`WhatsApp kuyruğuna eklenemedi: ${err}`);
        }
        return {
            message: isLate
                ? 'Görev gecikmeli olarak başlatıldı'
                : 'Görev başarıyla başlatıldı',
            task,
            distance_meters: distanceCheck.distance_meters,
            is_late: isLate,
        };
    }
    async completeTask(taskId, staffId, dto) {
        const task = await this.findOne(taskId);
        if (task.staff_id !== staffId) {
            throw new common_1.ForbiddenException('Bu görevi tamamlama yetkiniz yok');
        }
        if (task.status !== task_entity_1.TaskStatus.IN_PROGRESS &&
            task.status !== task_entity_1.TaskStatus.LATE) {
            throw new common_1.ConflictException('Bu görev henüz başlatılmamış');
        }
        task.status = task.is_late ? task_entity_1.TaskStatus.LATE : task_entity_1.TaskStatus.COMPLETED;
        task.completed_at = new Date();
        await this.taskRepo.save(task);
        const log = this.logRepo.create({
            task_id: taskId,
            staff_id: staffId,
            action: 'COMPLETE',
            location: dto.latitude
                ? {
                    type: 'Point',
                    coordinates: [dto.longitude, dto.latitude],
                }
                : null,
        });
        await this.logRepo.save(log);
        return {
            message: 'Görev tamamlandı',
            task,
        };
    }
    async checkConflict(staffId, days, start, end, excludeTaskId) {
        const qb = this.taskRepo
            .createQueryBuilder('task')
            .where('task.staff_id = :staffId', { staffId })
            .andWhere('task.scheduled_days && :days', { days })
            .andWhere('(task.schedule_start, task.schedule_end) OVERLAPS (:start::time, :end::time)', { start, end });
        if (excludeTaskId) {
            qb.andWhere('task.id != :excludeId', { excludeId: excludeTaskId });
        }
        const conflict = await qb.getOne();
        if (conflict) {
            throw new common_1.ConflictException(`Bu personelin belirtilen zaman diliminde zaten bir görevi var (Görev #${conflict.id})`);
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(task_log_entity_1.TaskLog)),
    __param(3, (0, bull_1.InjectQueue)('whatsapp')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        geofencing_service_1.GeofencingService, Object])
], TasksService);
//# sourceMappingURL=tasks.service.js.map