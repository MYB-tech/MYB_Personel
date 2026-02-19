import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Resident } from './resident.entity';
import { Task } from './task.entity';

@Entity('apartments')
export class Apartment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    // PostGIS POINT — stored as { type: 'Point', coordinates: [lng, lat] }
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location: { type: string; coordinates: number[] };

    @OneToMany(() => Resident, (r) => r.apartment, { cascade: true })
    residents: Resident[];

    @OneToMany(() => Task, (t) => t.apartment)
    tasks: Task[];

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
