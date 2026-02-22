import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Apartment } from './apartment.entity';

export enum ResidentType {
    OWNER = 'OWNER',
    TENANT = 'TENANT',
}

@Entity('residents')
export class Resident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, nullable: true })
    first_name: string;

    @Column({ length: 100, nullable: true })
    last_name: string;

    @Column({ length: 50, nullable: true })
    unit_number: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: ResidentType.OWNER,
    })
    type: ResidentType;

    @Column({ length: 20 })
    phone: string; // WhatsApp numarası

    @Index()
    @ManyToOne(() => Apartment, (a) => a.residents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apartment_id' })
    apartment: Apartment;

    @Column({ type: 'uuid' })
    apartment_id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
