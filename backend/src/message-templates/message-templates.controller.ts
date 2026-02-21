import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MessageTemplatesService } from './message-templates.service';
import { MessageTemplate } from '../entities/message-template.entity';

@Controller('message-templates')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class MessageTemplatesController {
    constructor(private readonly templatesService: MessageTemplatesService) { }

    @Get()
    findAll() {
        return this.templatesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.templatesService.findOne(id);
    }

    @Post()
    create(@Body() data: Partial<MessageTemplate>) {
        return this.templatesService.create(data);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<MessageTemplate>,
    ) {
        return this.templatesService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.templatesService.remove(id);
    }
}
