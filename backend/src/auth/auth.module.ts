import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { Staff } from '../entities/staff.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Staff]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (cfg: ConfigService) => ({
                secret: cfg.get<string>('JWT_SECRET', 'default-secret'),
                signOptions: { expiresIn: 60 * 60 * 24 * 7 }, // 7 gün (saniye)
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, RolesGuard],
    exports: [AuthService, JwtStrategy, RolesGuard, PassportModule],
})
export class AuthModule { }
