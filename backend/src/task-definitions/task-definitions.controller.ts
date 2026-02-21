import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TaskDefinitionsService } from './task-definitions.service';
import { CreateTaskDefinitionDto, UpdateTaskDefinitionDto } from './dto/task-definition.dto';

@Controller('task-definitions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TaskDefinitionsController {
    constructor(private readonly service: TaskDefinitionsService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('admin')
    create(@Body() dto: CreateTaskDefinitionDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateTaskDefinitionDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
