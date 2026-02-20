import {IUserRepository} from "../../core/repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../core/repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../core/entities/UserEntity";
import {UpdateUserDto} from "../../core/repositories/UserRepository/dto/UpdateUserDto";
import {prisma} from "../db";
import {UserMapper} from "../db/UserMapper";

export class UserRepository implements IUserRepository {
    async create(dto: CreateUserDto): Promise<UserEntity> {
        const user = await prisma.user.create({
            data: { ...dto },
        });
        return UserMapper.toEntity(user);
    }

    async delete(id: number): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await prisma.user.findMany();
        return users.map(UserMapper.toEntity);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user ? UserMapper.toEntity(user) : null;
    }

    async findByEmailWithPassword(email: string): Promise<(UserEntity & { password: string }) | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user ? UserMapper.toEntityWithPassword(user) : null;
    }

    async findById(id: number): Promise<UserEntity | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user ? UserMapper.toEntity(user) : null;;
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity | null> {
        const user = await prisma.user.update({
            where: { id },
            data: { ...dto }
        });
        return user ? UserMapper.toEntity(user) : null;
    }
}