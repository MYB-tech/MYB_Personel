import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Task } from './task.entity';
import { Staff } from './staff.entity';

@Entity('task_logs')
export class TaskLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @ManyToOne(() => Task, (t) => t.logs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id' })
    task: Task;

    @Column({ type: 'uuid' })
    task_id: string;

    @Index()
    @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'staff_id' })
    staff: Staff;

    @Column({ type: 'uuid' })
    staff_id: string;

    @Column({ length: 50 })
    action: string; // 'START' | 'COMPLETE'

    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    location: { type: string; coordinates: number[] } | null;

    @Column({ type: 'float', nullable: true })
    distance_meters: number | null;

    @CreateDateColumn({ type: 'timestamptz' })
    timestamp: Date;
}
