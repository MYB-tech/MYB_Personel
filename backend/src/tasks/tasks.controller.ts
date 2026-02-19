import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, StartTaskDto, CompleteTaskDto } from './dto/task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    @Roles('admin')
    findAll() {
        return this.tasksService.findAll();
    }

    @Get('my')
    findMyTasks(@Request() req: any) {
        return this.tasksService.findByStaff(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post()
    @Roles('admin')
    create(@Body() dto: CreateTaskDto) {
        return this.tasksService.create(dto);
    }

    @Post(':id/start')
    startTask(
        @Param('id') id: string,
        @Request() req: any,
        @Body() dto: StartTaskDto,
    ) {
        return this.tasksService.startTask(id, req.user.id, dto);
    }

    @Post(':id/complete')
    completeTask(
        @Param('id') id: string,
        @Request() req: any,
        @Body() dto: CompleteTaskDto,
    ) {
        return this.tasksService.completeTask(id, req.user.id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
