export interface CreateUserDto {
    lastName: string;
    firstName: string;
    middleName?: string;
    phone: string;
    birthday: Date;
    email: string;
    password: string;
    role: 'admin' | 'user';
}