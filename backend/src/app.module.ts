import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { AuthModule } from './auth/auth.module';
import { StaffModule } from './staff/staff.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { GeofencingModule } from './geofencing/geofencing.module';
import { TasksModule } from './tasks/tasks.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // ─── Global Config ───
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),

    // ─── PostgreSQL + PostGIS (TypeORM) ───
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get<string>('DB_USER', 'myb_user'),
        password: cfg.get<string>('DB_PASSWORD', 'myb_secret'),
        database: cfg.get<string>('DB_NAME', 'myb_personel'),
        autoLoadEntities: true,
        synchronize: cfg.get<string>('NODE_ENV') !== 'production',
        logging: cfg.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    // ─── Redis (BullMQ) ───
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get<string>('REDIS_HOST', 'localhost'),
          port: cfg.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // ─── Feature Modules ───
    AuthModule,
    StaffModule,
    ApartmentsModule,
    GeofencingModule,
    TasksModule,
    WhatsappModule,
    AnnouncementsModule,
    DashboardModule,
  ],
})
export class AppModule { }
