import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApartmentsService } from './apartments.service';
import {
    CreateApartmentDto,
    UpdateApartmentDto,
} from './dto/apartment.dto';

@Controller('apartments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ApartmentsController {
    constructor(private readonly aptService: ApartmentsService) { }

    @Get()
    findAll() {
        return this.aptService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.aptService.findOne(id);
    }

    @Post()
    @Roles('admin')
    create(@Body() dto: CreateApartmentDto) {
        return this.aptService.create(dto);
    }

    @Put(':id')
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
        return this.aptService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.aptService.remove(id);
    }

    @Post(':id/import-units')
    @Roles('admin')
    @UseInterceptors(FileInterceptor('file'))
    importUnits(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.aptService.importUnits(id, file.buffer);
    }
}
