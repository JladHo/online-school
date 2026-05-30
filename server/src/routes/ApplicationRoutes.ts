import { Router } from 'express';
import { ApplicationController } from '../presentation/controllers/ApplicationController';
import { ApplicationRepository } from '../infrastructure/repositories/ApplicationRepository';
import { PurchaseRepository } from '../infrastructure/repositories/PurchaseRepository';
import { ApplicationService } from '../core/services/ApplicationService/ApplicationService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validate } from '../middleware/ValidationMiddleware';
import { CreateApplicationSchema } from '../core/repositories/ApplicationRepository/dto/CreateApplicationDto';

const applicationRepository = new ApplicationRepository();
const purchaseRepository = new PurchaseRepository();
const applicationService = new ApplicationService(applicationRepository, purchaseRepository);
const applicationController = new ApplicationController(applicationService);

const router = Router();

router.get('/', AuthMiddleware, (req, res, next) => applicationController.getAll(req, res, next));
router.post('/', validate(CreateApplicationSchema), (req, res, next) => applicationController.create(req, res, next)); // No AuthMiddleware for creating from landing
router.patch('/:id/manager', AuthMiddleware, (req, res, next) => applicationController.assignManager(req, res, next));
router.patch('/:id/status', AuthMiddleware, (req, res, next) => applicationController.changeStatus(req, res, next));
router.post('/:id/purchase', AuthMiddleware, (req, res, next) => applicationController.createPurchaseFromApplication(req, res, next));

export const applicationRouter = router;
