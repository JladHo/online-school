export type UserRole = 'admin' | 'manager' | 'teacher' | 'user';

export interface UserEntity {
    id: number;
    parentName: string;
    studentName: string;
    phone: string;
    email: string;
    role: UserRole;
    birthday?: Date;
}