import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Apartment } from '../entities/apartment.entity';
import { Resident, ResidentType } from '../entities/resident.entity';
import {
    CreateApartmentDto,
    UpdateApartmentDto,
} from './dto/apartment.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ApartmentsService {
    constructor(
        @InjectRepository(Apartment)
        private readonly aptRepo: Repository<Apartment>,
        @InjectRepository(Resident)
        private readonly residentRepo: Repository<Resident>,
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

    async importUnits(id: string, buffer: Buffer) {
        const apt = await this.findOne(id);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        // Mevcut sakinleri temizle (isteğe bağlı, ama üzerine yazma mantığı için uygun)
        await this.residentRepo.delete({ apartment_id: id });

        const residentsToSave = [];

        for (const row of rows) {
            const unitNo = (row['Daire No'] || row['daire no'] || row['Daire'])?.toString();
            const ownerName = row['Mal Sahibi'] || row['mal sahibi'];
            const ownerPhone = row['Mal Sahibi Tel'] || row['mal sahibi tel'];
            const tenantName = row['Kiracı'] || row['kiracı'];
            const tenantPhone = row['Kiracı Tel'] || row['kiracı tel'];

            if (ownerName && ownerPhone) {
                residentsToSave.push(this.residentRepo.create({
                    first_name: ownerName.toString(),
                    phone: ownerPhone.toString().replace(/\D/g, ''),
                    unit_number: unitNo,
                    type: ResidentType.OWNER,
                    apartment_id: id
                }));
            }

            if (tenantName && tenantPhone) {
                residentsToSave.push(this.residentRepo.create({
                    first_name: tenantName.toString(),
                    phone: tenantPhone.toString().replace(/\D/g, ''),
                    unit_number: unitNo,
                    type: ResidentType.TENANT,
                    apartment_id: id
                }));
            }
        }

        if (residentsToSave.length > 0) {
            await this.residentRepo.save(residentsToSave);
        }

        // Daire sayısını güncelle
        const uniqueUnits = new Set(rows.map(row => (row['Daire No'] || row['daire no'] || row['Daire'])?.toString()).filter(Boolean));
        apt.unit_count = uniqueUnits.size;
        await this.aptRepo.save(apt);

        return { success: true, unitCount: apt.unit_count, residentCount: residentsToSave.length };
    }
}
