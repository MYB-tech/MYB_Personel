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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Controller('staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Get()
    @Roles('admin')
    findAll() {
        return this.staffService.findAll();
    }

    @Get(':id')
    @Roles('admin')
    findOne(@Param('id') id: string) {
        return this.staffService.findOne(id);
    }

    @Post()
    @Roles('admin')
    create(@Body() dto: CreateStaffDto) {
        return this.staffService.create(dto);
    }

    @Put(':id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
        return this.staffService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.staffService.remove(id);
    }
}
