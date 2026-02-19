import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apartment } from '../entities/apartment.entity';
import { Resident } from '../entities/resident.entity';
import { ApartmentsService } from './apartments.service';
import { ApartmentsController } from './apartments.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Apartment, Resident])],
    controllers: [ApartmentsController],
    providers: [ApartmentsService],
    exports: [ApartmentsService],
})
export class ApartmentsModule { }
