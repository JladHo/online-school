import {IUserRepository} from "../../repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../entities/UserEntity";
import {UpdateUserDto} from "../../repositories/UserRepository/dto/UpdateUserDto";
import {LoginDto} from "../../repositories/UserRepository/dto/LoginDto";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ConflictError, UnauthorizedError} from "../../errors/HttpError";

export class UserService {
    constructor(readonly userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async register(dto: CreateUserDto): Promise<UserEntity> {
        // Проверяем, существует ли юзер с таким емейлом
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictError('Пользователь с таким Email уже существует.')
        }

        // Хэшируем пароль
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // Создаем юзера в БД
        const newUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword
        });

        return newUser;
    }

    async login(dto: LoginDto): Promise<{user: UserEntity, accessToken: string}> {
        // Ищем юзера с емейлом
        const user = await this.userRepository.findByEmailWithPassword(dto.email)
        if (!user) {
            throw new ConflictError('Пользователь с таким Email не найден.');
        }

        // Проверяем его пароль
        const comparePassword = await bcrypt.compare(dto.password, user.password);
        if (!comparePassword) {
            throw new UnauthorizedError('Неверный пароль.');
        }

        // Делаем токен
        const payload = {id: user.id, email: user.email, role: user.role};
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT токен не определен.');
        }

        const accessToken = jwt.sign(payload, secret, {expiresIn: '24h'});
        const {password, ...userWithoutPassword} = user;
        return {user: userWithoutPassword, accessToken};
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