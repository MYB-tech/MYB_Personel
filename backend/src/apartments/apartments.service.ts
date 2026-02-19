import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apartment } from '../entities/apartment.entity';
import {
    CreateApartmentDto,
    UpdateApartmentDto,
} from './dto/apartment.dto';

@Injectable()
export class ApartmentsService {
    constructor(
        @InjectRepository(Apartment)
        private readonly aptRepo: Repository<Apartment>,
    ) { }

    async findAll(): Promise<Apartment[]> {
        return this.aptRepo.find({
            relations: ['residents'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Apartment> {
        const apt = await this.aptRepo.findOne({
            where: { id },
            relations: ['residents'],
        });
        if (!apt) throw new NotFoundException('Apartman bulunamadı');
        return apt;
    }

    async create(dto: CreateApartmentDto): Promise<Apartment> {
        const apt = this.aptRepo.create({
            name: dto.name,
            address: dto.address,
            location: {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            },
        });
        return this.aptRepo.save(apt);
    }

    async update(id: string, dto: UpdateApartmentDto): Promise<Apartment> {
        const apt = await this.findOne(id);
        if (dto.name) apt.name = dto.name;
        if (dto.address) apt.address = dto.address;
        if (dto.latitude !== undefined && dto.longitude !== undefined) {
            apt.location = {
                type: 'Point',
                coordinates: [dto.longitude, dto.latitude],
            };
        }
        return this.aptRepo.save(apt);
    }

    async remove(id: string): Promise<void> {
        const apt = await this.findOne(id);
        await this.aptRepo.remove(apt);
    }
}
