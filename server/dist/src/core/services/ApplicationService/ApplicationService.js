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
exports.ApplicationService = void 0;
const HttpError_1 = require("../../../errors/HttpError");
class ApplicationService {
    constructor(applicationRepository, purchaseRepository) {
        this.applicationRepository = applicationRepository;
        this.purchaseRepository = purchaseRepository;
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationRepository.findAll();
        });
    }
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationRepository.create(dto);
        });
    }
    assignManager(applicationId, managerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.applicationRepository.findById(applicationId);
            if (!application) {
                throw new HttpError_1.NotFoundError('Заявка не найдена');
            }
            const updated = yield this.applicationRepository.update(applicationId, { managerId });
            if (!updated) {
                throw new HttpError_1.NotFoundError('Не удалось обновить заявку');
            }
            return updated;
        });
    }
    changeStatus(applicationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.applicationRepository.findById(applicationId);
            if (!application) {
                throw new HttpError_1.NotFoundError('Заявка не найдена');
            }
            const updated = yield this.applicationRepository.update(applicationId, { status });
            if (!updated) {
                throw new HttpError_1.NotFoundError('Не удалось обновить заявку');
            }
            return updated;
        });
    }
    createPurchaseFromApplication(applicationId, userId, price) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.applicationRepository.findById(applicationId);
            if (!application) {
                throw new HttpError_1.NotFoundError('Заявка не найдена');
            }
            if (application.status === 'closed') {
                throw new HttpError_1.BadRequestError('Заявка уже закрыта');
            }
            const purchase = yield this.purchaseRepository.create({
                purchasePrice: price,
                userId,
                courseId: application.courseId
            });
            yield this.changeStatus(applicationId, 'closed');
            return purchase;
        });
    }
}
exports.ApplicationService = ApplicationService;
