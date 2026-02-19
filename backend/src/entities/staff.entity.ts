import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('staff')
export class Staff {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 20, unique: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    password_hash: string;

    @Column({ length: 50, default: 'field' })
    role: string; // 'field' | 'admin'

    @Column({ default: true })
    is_active: boolean;

    @OneToMany(() => Task, (t) => t.staff)
    tasks: Task[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
