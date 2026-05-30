import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../../core/services/AdminService/AdminService';

export class AdminController {
    constructor(private adminService: AdminService) {}

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await this.adminService.getStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.adminService.getAllUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.adminService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const user = await this.adminService.updateUser(id, req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.adminService.deleteUser(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const courses = await this.adminService.getAllCourses();
            res.json(courses);
        } catch (error) {
            next(error);
        }
    }

    async createCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const course = await this.adminService.createCourse(req.body);
            res.status(201).json(course);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const course = await this.adminService.updateCourse(id, req.body);
            res.json(course);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.adminService.deleteCourse(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getSalesHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const sales = await this.adminService.getSalesHistory();
            res.json(sales);
        } catch (error) {
            next(error);
        }
    }
}
