import { IsString } from "class-validator";


export class CreateArmeDto {
    @IsString()
    name: string;

    @IsString()
    image: string;
}