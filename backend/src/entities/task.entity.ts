import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Staff } from './staff.entity';
import { Apartment } from './apartment.entity';
import { TaskLog } from './task-log.entity';

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    COMPLETED_LATE = 'COMPLETED_LATE',
    LATE = 'LATE',
    OUT_OF_RANGE = 'OUT_OF_RANGE',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @ManyToOne(() => Staff, (s) => s.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'staff_id' })
    staff: Staff;

    @Column({ type: 'uuid' })
    staff_id: string;

    @Index()
    @ManyToOne(() => Apartment, (a) => a.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apartment_id' })
    apartment: Apartment;

    @Column({ type: 'uuid' })
    apartment_id: string;

    @Column({ length: 50 })
    type: string; // 'garbage', 'cleaning', vb.

    @Column({ type: 'text', array: true, default: '{}' })
    scheduled_days: string[]; // ['MON', 'WED', 'FRI']

    @Column({ type: 'time' })
    schedule_start: string;

    @Column({ type: 'time' })
    schedule_end: string;

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
    status: TaskStatus;

    @Column({ default: false })
    is_late: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    started_at: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    completed_at: Date | null;

    @OneToMany(() => TaskLog, (log) => log.task)
    logs: TaskLog[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
