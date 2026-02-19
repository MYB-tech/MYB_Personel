import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Apartment } from './apartment.entity';

@Entity('residents')
export class Resident {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ length: 20 })
    phone: string; // WhatsApp numarası

    @ManyToOne(() => Apartment, (a) => a.residents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'apartment_id' })
    apartment: Apartment;

    @Column({ type: 'uuid' })
    apartment_id: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
}
