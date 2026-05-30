"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
class ApplicationController {
    constructor(applicationService) {
        this.applicationService = applicationService;
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield this.applicationService.getAll();
                res.status(200).json(applications);
            }
            catch (error) {
                next(error);
            }
        });
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dto = req.body;
                const application = yield this.applicationService.create(dto);
                res.status(201).json(application);
            }
            catch (error) {
                next(error);
            }
        });
    }
    assignManager(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const { managerId } = req.body;
                const application = yield this.applicationService.assignManager(id, managerId);
                res.status(200).json(application);
            }
            catch (error) {
                next(error);
            }
        });
    }
    changeStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const { status } = req.body;
                const application = yield this.applicationService.changeStatus(id, status);
                res.status(200).json(application);
            }
            catch (error) {
                next(error);
            }
        });
    }
    createPurchaseFromApplication(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(String(req.params.id), 10);
                const { userId, price } = req.body;
                const purchase = yield this.applicationService.createPurchaseFromApplication(id, userId, price);
                res.status(201).json(purchase);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ApplicationController = ApplicationController;
