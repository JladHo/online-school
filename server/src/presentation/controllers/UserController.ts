import {UserService} from "../../core/services/UserService/UserService";
import {Request, Response, NextFunction} from "express";
import {LoginDto} from "../../core/repositories/UserRepository/dto/LoginDto";
import {UpdateUserDto} from "../../core/repositories/UserRepository/dto/UpdateUserDto";
import {CreateUserDto} from "../../core/repositories/UserRepository/dto/CreateUserDto";

export class UserController {
    constructor(private readonly userService: UserService) {}

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const createUserDto: CreateUserDto = req.body;
            const result = await this.userService.create(createUserDto);
            res.status(201).json(result);
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
            const authUser = (req as any).user;
            
            // Only allow users to update their own profile, unless they are admin
            if (authUser.id !== userId && authUser.role !== 'admin') {
                return res.status(403).json({ message: 'Нет доступа для изменения чужого профиля' });
            }

            const updateUserDto: UpdateUserDto = req.body;
            // Prevent changing role via this endpoint
            delete (updateUserDto as any).role;
            
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

    async getPointsHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const history = await this.userService.getPointsHistory(userId);
            res.status(200).json(history);
        } catch (error) {
            next(error);
        }
    }

    async getStoreItems(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await this.userService.getStoreItems();
            res.status(200).json(items);
        } catch (error) {
            next(error);
        }
    }

    async getUserCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const courses = await this.userService.getUserCourses(userId);
            res.status(200).json(courses);
        } catch (error) {
            next(error);
        }
    }

    async getUserGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const groups = await this.userService.getUserGroups(userId);
            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    }

    async getStudentsForManager(req: Request, res: Response, next: NextFunction) {
        try {
            const students = await this.userService.getStudentsForManager();
            res.status(200).json(students);
        } catch (error) {
            next(error);
        }
    }

    async getFreePool(req: Request, res: Response, next: NextFunction) {
        try {
            const pool = await this.userService.getFreePool();
            res.status(200).json(pool);
        } catch (error) {
            next(error);
        }
    }

    async purchaseItem(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const { itemId } = req.body;
            const updatedUser = await this.userService.purchaseStoreItem(userId, itemId);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async grantCourseAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const { courseId } = req.body;
            const purchase = await this.userService.grantCourseAccess(userId, courseId);
            res.status(201).json(purchase);
        } catch (error) {
            next(error);
        }
    }

    async revokeCourseAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(String(req.params.id), 10);
            const courseId = parseInt(String(req.params.courseId), 10);
            await this.userService.revokeCourseAccess(userId, courseId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getStoreOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const orders = await this.userService.getStoreOrders();
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    }

    async updateStoreOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const orderId = parseInt(String(req.params.orderId), 10);
            const { status } = req.body;
            const managerId = (req as any).user.id;
            const updatedOrder = await this.userService.updateStoreOrder(orderId, status, managerId);
            res.status(200).json(updatedOrder);
        } catch (error) {
            next(error);
        }
    }
}
