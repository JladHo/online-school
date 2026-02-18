import {IUserRepository} from "../../repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../entities/UserEntity";
import bcrypt from 'bcrypt';
import {UpdateUserDto} from "../../repositories/UserRepository/dto/UpdateUserDto";

export class UserService {
    constructor(readonly userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async register(dto: CreateUserDto): Promise<UserEntity> {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const createdUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword
        });
        return createdUser;
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRepository.findById(id);
    }

    async findAll(): Promise<UserEntity[]> {
        return this.userRepository.findAll();
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity | null> {
        const dataToUpdate: UpdateUserDto = { ...dto };
        if (dto.password) {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            dataToUpdate.password = hashedPassword;
        }
        const updateUser = await this.userRepository.update(id, dataToUpdate);
        return updateUser;
    }

    async delete(id: number) {
        return this.userRepository.delete(id);
    }
}