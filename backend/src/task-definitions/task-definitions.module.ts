import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskDefinition } from '../entities/task-definition.entity';
import { TaskDefinitionsService } from './task-definitions.service';
import { TaskDefinitionsController } from './task-definitions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TaskDefinition])],
    providers: [TaskDefinitionsService],
    controllers: [TaskDefinitionsController],
    exports: [TaskDefinitionsService],
})
export class TaskDefinitionsModule implements OnModuleInit {
    constructor(private readonly service: TaskDefinitionsService) { }

    async onModuleInit() {
        await this.service.seed();
    }
}
