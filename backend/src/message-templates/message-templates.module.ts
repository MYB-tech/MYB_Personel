import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageTemplate } from '../entities/message-template.entity';
import { MessageTemplatesService } from './message-templates.service';
import { MessageTemplatesController } from './message-templates.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MessageTemplate])],
    providers: [MessageTemplatesService],
    controllers: [MessageTemplatesController],
    exports: [MessageTemplatesService],
})
export class MessageTemplatesModule { }
