import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AnnouncementsController } from './announcements.controller';

@Module({
    imports: [BullModule.registerQueue({ name: 'whatsapp' })],
    controllers: [AnnouncementsController],
})
export class AnnouncementsModule { }
