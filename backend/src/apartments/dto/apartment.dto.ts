import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateApartmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}

export class UpdateApartmentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;
}
