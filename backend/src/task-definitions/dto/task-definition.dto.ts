import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateTaskDefinitionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsInt()
    @IsOptional()
    message_template_id?: number;
}

export class UpdateTaskDefinitionDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsInt()
    @IsOptional()
    message_template_id?: number;
}
