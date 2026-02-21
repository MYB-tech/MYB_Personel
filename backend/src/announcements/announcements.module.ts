import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsController } from './announcements.controller';
import { Resident } from '../entities/resident.entity';
import { Apartment } from '../entities/apartment.entity';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'whatsapp' }),
        TypeOrmModule.forFeature([Resident, Apartment]),
    ],
    controllers: [AnnouncementsController],
})
export class AnnouncementsModule { }
