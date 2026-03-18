import {User as PrismaUser} from '@prisma/client';
import {UserEntity} from "../../../core/entities/UserEntity";

export class UserMapper {
    public static toEntity(user: PrismaUser): UserEntity {
        return {
            id: user.id,
            parentName: user.parentName,
            studentName: user.studentName,
            phone: user.phone,
            email: user.email,
            role: user.role,
            birthday: user.birthday ?? undefined,
        }
    }
    public static toEntityWithPassword(user: PrismaUser): UserEntity & { password: string } {
        return {
            id: user.id,
            parentName: user.parentName,
            studentName: user.studentName,
            phone: user.phone,
            email: user.email,
            role: user.role,
            birthday: user.birthday ?? undefined,
            password: user.password,
        }
    }
}