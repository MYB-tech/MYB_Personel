import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { MessageTemplate } from './message-template.entity';
import { Task } from './task.entity';

@Entity('task_definitions')
export class TaskDefinition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50, nullable: true })
    icon: string;

    @Column({ type: 'int', nullable: true })
    message_template_id: number | null;

    @ManyToOne(() => MessageTemplate, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'message_template_id' })
    message_template: MessageTemplate | null;

    @OneToMany(() => Task, (task) => task.definition)
    tasks: Task[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
