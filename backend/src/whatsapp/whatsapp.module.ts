import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaApiClient } from './meta-api.client';
import { WhatsappProcessor } from './whatsapp.processor';
import { Resident } from '../entities/resident.entity';
import { MessageTemplate } from '../entities/message-template.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Resident, MessageTemplate]),
        BullModule.registerQueue({ name: 'whatsapp' }),
    ],
    providers: [MetaApiClient, WhatsappProcessor],
    exports: [MetaApiClient],
})
export class WhatsappModule { }
