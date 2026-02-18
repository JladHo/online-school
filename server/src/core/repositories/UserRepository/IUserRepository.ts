import {CreateUserDto} from "./dto/CreateUserDto";
import {UpdateUserDto} from "./dto/UpdateUserDto";
import {LoginDto} from "./dto/LoginDto";
import {UserEntity} from "../../entities/UserEntity";
export interface IUserRepository {
    create(dto: CreateUserDto): Promise<UserEntity>;
    login(dto: LoginDto): Promise<UserEntity>;
    findById(id: number): Promise<UserEntity | null>;
    findAll(): Promise<UserEntity[]>;
    update(id: number, dto: UpdateUserDto): Promise<UserEntity | null>;
    delete(id: number): Promise<void>;
}