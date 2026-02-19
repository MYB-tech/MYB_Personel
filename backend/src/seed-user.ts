import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StaffService } from './staff/staff.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const staffService = app.get(StaffService);

    const staffDto: any = {
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
