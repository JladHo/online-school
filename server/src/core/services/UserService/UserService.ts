import {IUserRepository} from "../../repositories/UserRepository/IUserRepository";
import {CreateUserDto} from "../../repositories/UserRepository/dto/CreateUserDto";
import {UserEntity} from "../../entities/UserEntity";
import {UpdateUserDto} from "../../repositories/UserRepository/dto/UpdateUserDto";
import {LoginDto} from "../../repositories/UserRepository/dto/LoginDto";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {ConflictError, UnauthorizedError} from "../../../errors/HttpError";

function generatePassword(length = 10): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export class UserService {
    constructor(private readonly userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async create(dto: CreateUserDto): Promise<{ user: UserEntity, generatedPassword: string }> {
        // Проверяем, существует ли юзер с таким емейлом
        const existingUserEmail = await this.userRepository.findByEmail(dto.email);
        if (existingUserEmail) {
            throw new ConflictError('Пользователь с таким Email уже существует.')
        }

        // Проверяем, существует ли юзер с таким телефоном
        const existingUserPhone = await this.userRepository.findByPhone(dto.phone);
        if (existingUserPhone) {
            throw new ConflictError('Пользователь с таким номером телефона уже существует.')
        }

        const generatedPassword = generatePassword();
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

        // Создаем юзера в БД
        const newUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword
        });

        return { user: newUser, generatedPassword };
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
        return {user: userWithoutPassword as UserEntity, accessToken};
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
