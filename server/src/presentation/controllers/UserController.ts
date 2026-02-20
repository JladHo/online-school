import {UserService} from "../../core/services/UserService/UserService";
import {Request, Response, NextFunction} from "express";
import {CreateUserDto} from "../../core/repositories/UserRepository/dto/CreateUserDto";
import {LoginDto} from "../../core/repositories/UserRepository/dto/LoginDto";
import {UpdateUserDto} from "../../core/repositories/UserRepository/dto/UpdateUserDto";

export class UserController {
    constructor(private readonly userService: UserService) {}

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const createUserDto: CreateUserDto = req.body;
            const newUser = await this.userService.register(createUserDto);
            res.status(201).json(newUser)
            return;
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const loginDto: LoginDto = req.body;
            const result = await this.userService.login(loginDto);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.findAll();
            res.status(200).json(users);
        } catch (error) {
            next(error)
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const user = await this.userService.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const updateUserDto: UpdateUserDto = req.body;
            const updatedUser = await this.userService.update(userId, updateUserDto);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const user = await this.userService.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await this.userService.delete(userId)
            res.status(204).send();
        } catch (error) {
            next(error)
        }
    }
}