import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @Roles('admin')
    async getStats() {
        return this.dashboardService.getStats();
    }

    @Get('weekly-schedule')
    @Roles('admin')
    async getWeeklySchedule() {
        return this.dashboardService.getWeeklySchedule();
    }
}
