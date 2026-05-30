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
exports.PurchaseRepository = void 0;
const db_1 = require("../db");
const PurchaseMapper_1 = require("../db/mappers/PurchaseMapper");
class PurchaseRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchase = yield db_1.prisma.purchase.create({
                data: Object.assign({}, dto),
            });
            return PurchaseMapper_1.PurchaseMapper.toEntity(purchase);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchase = yield db_1.prisma.purchase.findUnique({
                where: { id },
            });
            return purchase ? PurchaseMapper_1.PurchaseMapper.toEntity(purchase) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const purchases = yield db_1.prisma.purchase.findMany();
            return purchases.map(PurchaseMapper_1.PurchaseMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchase = yield db_1.prisma.purchase.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return PurchaseMapper_1.PurchaseMapper.toEntity(purchase);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.purchase.delete({
                where: { id },
            });
        });
    }
}
exports.PurchaseRepository = PurchaseRepository;
