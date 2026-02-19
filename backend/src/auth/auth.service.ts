import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Staff } from '../entities/staff.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Staff)
        private readonly staffRepo: Repository<Staff>,
        private readonly jwtService: JwtService,
    ) { }

    async login(phone: string, password: string) {
        const user = await this.staffRepo.findOne({ where: { phone } });
        if (!user) {
            throw new UnauthorizedException('Geçersiz telefon numarası veya şifre');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new UnauthorizedException('Geçersiz telefon numarası veya şifre');
        }

        const payload = { sub: user.id, phone: user.phone, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
        };
    }

    async validateUser(userId: string): Promise<Staff | null> {
        return this.staffRepo.findOne({ where: { id: userId, is_active: true } });
    }
}
