import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StaffService } from './staff/staff.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const staffService = app.get(StaffService);

    const staffDto: any = {
        name: 'Mete Yazıcı',
        phone: '5337144046',
        password: 'Mete123',
        role: 'admin',
        isActive: true,
    };

    try {
        const existing = await staffService.findByPhone(staffDto.phone);
        if (existing) {
            console.log('User already exists:', existing);
        } else {
            const user = await staffService.create(staffDto);
            console.log('User created:', user);
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }

    await app.close();
}

bootstrap();
