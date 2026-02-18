import {CreateUserDto} from "./dto/CreateUserDto";
import {UpdateUserDto} from "./dto/UpdateUserDto";
import {UserEntity} from "../../entities/UserEntity";
export interface IUserRepository {
    create(dto: CreateUserDto): Promise<UserEntity>;
    findById(id: number): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByEmailWithPassword(email: string): Promise<(UserEntity & {password: string}) | null>;
    findAll(): Promise<UserEntity[]>;
    update(id: number, dto: UpdateUserDto): Promise<UserEntity | null>;
    delete(id: number): Promise<void>;
}