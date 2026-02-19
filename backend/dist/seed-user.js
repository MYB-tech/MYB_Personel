"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const staff_service_1 = require("./staff/staff.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const staffService = app.get(staff_service_1.StaffService);
    const staffDto = {
        name: 'Ahmet Yılmaz',
        phone: '5551112233',
        password: 'password123',
        role: 'field',
        isActive: true,
    };
    try {
        const existing = await staffService.findByPhone(staffDto.phone);
        if (existing) {
            console.log('User already exists:', existing);
        }
        else {
            const user = await staffService.create(staffDto);
            console.log('User created:', user);
        }
    }
    catch (error) {
        console.error('Error creating user:', error);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-user.js.map