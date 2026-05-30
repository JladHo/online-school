import { Request, Response, NextFunction } from 'express';
import { ModuleService } from '../../core/services/ModuleService/ModuleService';
import { CreateModuleSchema } from '../../core/repositories/ModuleRepository/dto/CreateModuleDto';
import { UpdateModuleSchema } from '../../core/repositories/ModuleRepository/dto/UpdateModuleDto';

export class ModuleController {
    constructor(private readonly moduleService: ModuleService) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const module = await this.moduleService.create(data);
            res.status(201).json(module);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const module = await this.moduleService.findById(id);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.status(200).json(module);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const modules = await this.moduleService.findAll();
            res.status(200).json(modules);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const data = req.body;
            const module = await this.moduleService.update(id, data);
            if (!module) {
                return res.status(404).json({ message: 'Module not found' });
            }
            res.status(200).json(module);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            await this.moduleService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
