import {
    IsEmail,
    IsString,
    MinLength,
    IsOptional,
    IsDateString
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Фамилия должна быть строкой.' })
    lastName?: string;

    @IsOptional()
    @IsString({ message: 'Имя должно быть строкой.' })
    firstName?: string;

    @IsOptional()
    @IsString({ message: 'Отчество должно быть строкой.' })
    middleName?: string;

    @IsOptional()
    @IsString({ message: 'Телефон должен быть строкой.' })
    phone?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Дата рождения должна быть в формате даты ISO 8601.' })
    birthday?: Date;

    @IsOptional()
    @IsEmail({}, { message: 'Некорректный формат email.' })
    email?: string;

    @IsOptional()
    @MinLength(8, { message: 'Пароль должен содержать не менее 8 символов.' })
    password?: string;
}
