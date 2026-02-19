import type { Job } from 'bull';
import { Repository } from 'typeorm';
import { MetaApiClient } from './meta-api.client';
import { Resident } from '../entities/resident.entity';
export declare class WhatsappProcessor {
    private readonly metaApi;
    private readonly residentRepo;
    private readonly logger;
    constructor(metaApi: MetaApiClient, residentRepo: Repository<Resident>);
    handleTaskStarted(job: Job): Promise<void>;
    handleBulkAnnouncement(job: Job): Promise<void>;
}
