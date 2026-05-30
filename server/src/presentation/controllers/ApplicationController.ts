import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../../core/services/ApplicationService/ApplicationService';
import { ApplicationStatus } from '../../core/entities/ApplicationEntity';
import { CreateApplicationSchema } from '../../core/repositories/ApplicationRepository/dto/CreateApplicationDto';

export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const applications = await this.applicationService.getAll();
            res.status(200).json(applications);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = req.body;
            const application = await this.applicationService.create(dto);
            res.status(201).json(application);
        } catch (error) {
            next(error);
        }
    }

    async assignManager(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const { managerId } = req.body;
            const application = await this.applicationService.assignManager(id, managerId);
            res.status(200).json(application);
        } catch (error) {
            next(error);
        }
    }

    async changeStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const { status } = req.body as { status: ApplicationStatus };
            const application = await this.applicationService.changeStatus(id, status);
            res.status(200).json(application);
        } catch (error) {
            next(error);
        }
    }

    async createPurchaseFromApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const { userId, price } = req.body;
            const purchase = await this.applicationService.createPurchaseFromApplication(id, userId, price);
            res.status(201).json(purchase);
        } catch (error) {
            next(error);
        }
    }
}
