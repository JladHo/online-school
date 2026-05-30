export type UserRole = 'admin' | 'manager' | 'teacher' | 'user';

export interface UserEntity {
    id: number;
    email: string;
    phone: string | null;
    role: UserRole;
    fullName: string | null;
    birthday: Date | null;
    parentName: string | null;
    studentName: string | null;
    bonusPoints: number;
}
