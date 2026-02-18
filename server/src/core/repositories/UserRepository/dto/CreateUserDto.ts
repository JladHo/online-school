import {
    IsEmail,
    IsString,
    MinLength,
    IsOptional,
    IsDateString,
    IsIn,
    IsNotEmpty
} from 'class-validator';
import { UserRole } from "../../../entities/UserEntity";

export class CreateUserDto {
    @IsString({ message: 'Фамилия должна быть строкой.' })
    @IsNotEmpty({ message: 'Фамилия не может быть пустой.' })
    lastName!: string;

    @IsString({ message: 'Имя должно быть строкой.' })
    @IsNotEmpty({ message: 'Имя не может быть пустым.' })
    firstName!: string;

    @IsOptional()
    @IsString({ message: 'Отчество должно быть строкой.' })
    middleName?: string;

    @IsString({ message: 'Телефон должен быть строкой.' })
    @IsNotEmpty({ message: 'Телефон не может быть пустым.' })
    phone!: string;

    @IsDateString({}, { message: 'Дата рождения должна быть в формате даты ISO 8601.' })
    birthday!: Date;

    @IsEmail({}, { message: 'Некорректный формат email.' })
    email!: string;

    @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов.' })
    password!: string;

    @IsIn(['admin', 'user'], { message: 'Роль может быть только "admin" или "user".' })
    role!: UserRole;
}
