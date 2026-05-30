import {User as PrismaUser} from '@prisma/client';
import {UserEntity} from "../../../core/entities/UserEntity";

export class UserMapper {
    public static toEntity(user: PrismaUser): UserEntity {
        return {
            id: user.id,
            parentName: user.parentName,
            studentName: user.studentName,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role as UserEntity['role'],
            birthday: user.birthday,
            bonusPoints: user.bonusPoints,
        }
    }
    public static toEntityWithPassword(user: PrismaUser): UserEntity & { password: string } {
        return {
            ...UserMapper.toEntity(user),
            password: user.password,
        }
    }
}
