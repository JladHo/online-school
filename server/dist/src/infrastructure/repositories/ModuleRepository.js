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
exports.ModuleRepository = void 0;
const db_1 = require("../db");
const ModuleMapper_1 = require("../db/mappers/ModuleMapper");
class ModuleRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = Object.assign({}, dto);
            if (payload.description === undefined)
                payload.description = null;
            const module = yield db_1.prisma.module.create({
                data: payload,
            });
            return ModuleMapper_1.ModuleMapper.toEntity(module);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = yield db_1.prisma.module.findUnique({
                where: { id },
            });
            return module ? ModuleMapper_1.ModuleMapper.toEntity(module) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = yield db_1.prisma.module.findMany();
            return modules.map(ModuleMapper_1.ModuleMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = Object.assign({}, dto);
            if (payload.description === undefined && 'description' in payload)
                payload.description = null;
            const module = yield db_1.prisma.module.update({
                where: { id },
                data: payload,
            });
            return ModuleMapper_1.ModuleMapper.toEntity(module);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.module.delete({
                where: { id },
            });
        });
    }
}
exports.ModuleRepository = ModuleRepository;
