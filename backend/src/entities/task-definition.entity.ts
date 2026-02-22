import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { MessageTemplate } from './message-template.entity';

@Entity('task_definitions')
export class TaskDefinition {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50, unique: true })
    code: string;

    @Column({ length: 50, default: 'task_alt' })
    icon: string;

    @Column({ nullable: true })
    message_template_id: number;

    @ManyToOne(() => MessageTemplate, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'message_template_id' })
    message_template: MessageTemplate;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
