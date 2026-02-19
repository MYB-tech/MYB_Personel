"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const auth_module_1 = require("./auth/auth.module");
const staff_module_1 = require("./staff/staff.module");
const apartments_module_1 = require("./apartments/apartments.module");
const geofencing_module_1 = require("./geofencing/geofencing.module");
const tasks_module_1 = require("./tasks/tasks.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const announcements_module_1 = require("./announcements/announcements.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('DB_HOST', 'localhost'),
                    port: cfg.get('DB_PORT', 5432),
                    username: cfg.get('DB_USER', 'myb_user'),
                    password: cfg.get('DB_PASSWORD', 'myb_secret'),
                    database: cfg.get('DB_NAME', 'myb_personel'),
                    autoLoadEntities: true,
                    synchronize: cfg.get('NODE_ENV') !== 'production',
                    logging: cfg.get('NODE_ENV') !== 'production',
                }),
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    redis: {
                        host: cfg.get('REDIS_HOST', 'localhost'),
                        port: cfg.get('REDIS_PORT', 6379),
                    },
                }),
            }),
            auth_module_1.AuthModule,
            staff_module_1.StaffModule,
            apartments_module_1.ApartmentsModule,
            geofencing_module_1.GeofencingModule,
            tasks_module_1.TasksModule,
            whatsapp_module_1.WhatsappModule,
            announcements_module_1.AnnouncementsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map