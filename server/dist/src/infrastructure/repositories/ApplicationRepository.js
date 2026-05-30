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
exports.ApplicationRepository = void 0;
const db_1 = require("../db");
const ApplicationMapper_1 = require("../db/mappers/ApplicationMapper");
class ApplicationRepository {
    create(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield db_1.prisma.application.create({
                data: Object.assign({}, dto),
            });
            return ApplicationMapper_1.ApplicationMapper.toEntity(application);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield db_1.prisma.application.findUnique({
                where: { id },
            });
            return application ? ApplicationMapper_1.ApplicationMapper.toEntity(application) : null;
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const applications = yield db_1.prisma.application.findMany();
            return applications.map(ApplicationMapper_1.ApplicationMapper.toEntity);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield db_1.prisma.application.update({
                where: { id },
                data: Object.assign({}, dto),
            });
            return ApplicationMapper_1.ApplicationMapper.toEntity(application);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.application.delete({
                where: { id },
            });
        });
    }
}
exports.ApplicationRepository = ApplicationRepository;
