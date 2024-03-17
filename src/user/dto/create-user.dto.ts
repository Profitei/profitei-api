import { IsNumber, IsString, IsEmail, IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    cpf: string;

    @IsDate()
    @IsNotEmpty()
    created: Date;

    @IsDate()
    @IsOptional()
    modified?: Date;
}
