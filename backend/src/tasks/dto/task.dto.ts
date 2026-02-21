import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsNumber,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    staff_id: string;

    @IsString()
    @IsNotEmpty()
    apartment_id: string;

    @IsString()
    @IsNotEmpty()
    type: string; // 'garbage' | 'cleaning' | etc.

    @IsString()
    @IsOptional()
    definition_id?: string;

    @IsArray()
    @IsString({ each: true })
    scheduled_days: string[]; // ['MON', 'WED', 'FRI']

    @IsString()
    @IsNotEmpty()
    schedule_start: string; // '19:00'

    @IsString()
    @IsNotEmpty()
    schedule_end: string; // '20:00'
}

export class StartTaskDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}

export class CompleteTaskDto {
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;
}
