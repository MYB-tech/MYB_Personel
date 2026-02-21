import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('message_templates')
export class MessageTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: false })
    is_meta: boolean;

    @Column({ nullable: true })
    meta_template_name: string;

    @Column({ default: 'tr' })
    meta_language: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}
