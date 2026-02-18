export type UserRole = 'admin' | 'user';

export interface UserEntity {
    id: number;
    lastName: string;
    firstName: string;
    middleName?: string;
    phone: string;
    email: string;
    role: UserRole;
    birthday?: Date;
}