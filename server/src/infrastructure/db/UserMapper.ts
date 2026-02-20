import {User as PrismaUser} from '@prisma/client';
import {UserEntity} from "../../core/entities/UserEntity";

export class UserMapper {
    public static toEntity(user: PrismaUser): UserEntity {
        return {
            id: user.id,
            lastName: user.lastName,
            firstName: user.firstName,
            middleName: user.middleName ?? undefined,
            phone: user.phone,
            email: user.email,
            role: user.role,
            birthday: user.birthday ?? undefined,
        }
    }
    public static toEntityWithPassword(user: PrismaUser): UserEntity & { password: string } {
        return {
            id: user.id,
            lastName: user.lastName,
            firstName: user.firstName,
            middleName: user.middleName ?? undefined,
            phone: user.phone,
            email: user.email,
            role: user.role,
            birthday: user.birthday ?? undefined,
            password: user.password,
        }
    }
}