import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { Staff } from '../entities/staff.entity';
import { Apartment } from '../entities/apartment.entity';
import { Task } from '../entities/task.entity';
import { TaskLog } from '../entities/task-log.entity';

describe('DashboardService', () => {
    let service: DashboardService;
    let staffRepo: any;
    let apartmentRepo: any;
    let taskRepo: any;
    let logRepo: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                {
                    provide: getRepositoryToken(Staff),
                    useValue: {
                        count: jest.fn().mockResolvedValue(10),
                    },
                },
                {
                    provide: getRepositoryToken(Apartment),
                    useValue: {
                        count: jest.fn().mockResolvedValue(5),
                    },
                },
                {
                    provide: getRepositoryToken(Task),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnThis(),
                            orWhere: jest.fn().mockReturnThis(),
                            getCount: jest.fn().mockResolvedValue(3),
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(TaskLog),
                    useValue: {
                        find: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
        staffRepo = module.get(getRepositoryToken(Staff));
        apartmentRepo = module.get(getRepositoryToken(Apartment));
        taskRepo = module.get(getRepositoryToken(Task));
        logRepo = module.get(getRepositoryToken(TaskLog));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return stats', async () => {
        const stats = await service.getStats();
        expect(stats.totalStaff).toBe(10);
        expect(stats.totalApartments).toBe(5);
        expect(stats.todayTasks).toBe(3);
        expect(stats.lateTasks).toBe(3);
        expect(stats.recentActivities).toEqual([]);
    });
});
