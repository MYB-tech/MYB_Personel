import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apartment } from '../entities/apartment.entity';
import { GeofencingService } from './geofencing.service';

@Module({
    imports: [TypeOrmModule.forFeature([Apartment])],
    providers: [GeofencingService],
    exports: [GeofencingService],
})
export class GeofencingModule { }
