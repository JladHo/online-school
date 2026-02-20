import {IUserRepository} from "../../core/repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../core/repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../core/entities/UserEntity";
import {UpdateUserDto} from "../../core/repositories/UserRepository/dto/UpdateUserDto";
import {prisma} from "../db";

export class UserRepository implements IUserRepository {
    async create(dto: CreateUserDto): Promise<UserEntity> {
        const user = await prisma.user.create({
            data: { ...dto },
        });
        return user;
    }

    async delete(id: number): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await prisma.user.findMany();
        return users;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    async findByEmailWithPassword(email: string): Promise<(UserEntity & { password: string }) | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    async findById(id: number): Promise<UserEntity | null> {
        const user = prisma.user.findUnique({
            where: { id },
        });
        return user;
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity | null> {
        const user = prisma.user.update({
            where: { id },
            data: { ...dto }
        });
        return user;
    }
}