import { Router } from 'express';
import { ModuleController } from '../presentation/controllers/ModuleController';
import { ModuleRepository } from '../infrastructure/repositories/ModuleRepository';
import { ModuleService } from '../core/services/ModuleService/ModuleService';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validate } from '../middleware/ValidationMiddleware';
import { CreateModuleSchema } from '../core/repositories/ModuleRepository/dto/CreateModuleDto';
import { UpdateModuleSchema } from '../core/repositories/ModuleRepository/dto/UpdateModuleDto';

const moduleRepository = new ModuleRepository();
const moduleService = new ModuleService(moduleRepository);
const moduleController = new ModuleController(moduleService);

const router = Router();

router.post('/', AuthMiddleware, validate(CreateModuleSchema), (req, res, next) => moduleController.create(req, res, next));
router.get('/', AuthMiddleware, (req, res, next) => moduleController.getAll(req, res, next));
router.get('/:id', AuthMiddleware, (req, res, next) => moduleController.getById(req, res, next));
router.patch('/:id', AuthMiddleware, validate(UpdateModuleSchema), (req, res, next) => moduleController.update(req, res, next));
router.delete('/:id', AuthMiddleware, (req, res, next) => moduleController.delete(req, res, next));

export const moduleRouter = router;
