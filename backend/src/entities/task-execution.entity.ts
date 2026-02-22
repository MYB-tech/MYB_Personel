import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { Task, TaskStatus } from './task.entity';

@Entity('task_executions')
@Index(['task_id', 'date'], { unique: true })
export class TaskExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Task, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id' })
    task: Task;

    @Column({ type: 'uuid' })
    task_id: string;

    @Column({ type: 'date' })
    date: string; // ISO format: YYYY-MM-DD

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
    status: TaskStatus;

    @Column({ default: false })
    is_late: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    started_at: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    completed_at: Date | null;

    @Column({ type: 'float', nullable: true })
    distance_meters: number | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
