import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    role?: string;
}

export class UpdateStaffDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
