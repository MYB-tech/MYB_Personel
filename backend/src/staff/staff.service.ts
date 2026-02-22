import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Staff } from '../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(Staff)
        private readonly staffRepo: Repository<Staff>,
    ) { }

    async findAll(): Promise<Staff[]> {
        return this.staffRepo.find({ order: { created_at: 'DESC' } });
    }

    async findOne(id: string): Promise<Staff> {
        const staff = await this.staffRepo.findOne({ where: { id } });
        if (!staff) throw new NotFoundException('Personel bulunamadı');
        return staff;
    }

    async findByPhone(phone: string): Promise<Staff | null> {
        return this.staffRepo.findOne({ where: { phone } });
    }

    async create(dto: CreateStaffDto): Promise<Staff> {
        const normalizedPhone = this.normalizePhone(dto.phone);
        const existing = await this.staffRepo.findOne({
            where: { phone: normalizedPhone },
        });
        if (existing) {
            throw new ConflictException('Bu telefon numarası zaten kayıtlı');
        }

        const hash = await bcrypt.hash(dto.password, 10);
        const staff = this.staffRepo.create({
            name: dto.name,
            phone: normalizedPhone,
            password_hash: hash,
            role: dto.role || 'field',
        });
        return this.staffRepo.save(staff);
    }

    async update(id: string, dto: UpdateStaffDto): Promise<Staff> {
        const staff = await this.findOne(id);

        if (dto.name) staff.name = dto.name;
        if (dto.phone) staff.phone = this.normalizePhone(dto.phone);
        if (dto.is_active !== undefined) staff.is_active = dto.is_active;
        if (dto.role) staff.role = dto.role;
        if (dto.password) {
            staff.password_hash = await bcrypt.hash(dto.password, 10);
        }

        return this.staffRepo.save(staff);
    }

    private normalizePhone(phone: string): string {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }
        return cleaned;
    }

    async remove(id: string): Promise<void> {
        const staff = await this.findOne(id);
        await this.staffRepo.remove(staff);
    }
}
