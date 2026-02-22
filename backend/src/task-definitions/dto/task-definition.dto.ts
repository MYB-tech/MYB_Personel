import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTaskDefinitionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsNumber()
    @IsOptional()
    message_template_id?: number;
}

export class UpdateTaskDefinitionDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    code?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsNumber()
    @IsOptional()
    message_template_id?: number;
}
